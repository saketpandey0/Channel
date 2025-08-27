import { Request, response, Response, Router } from "express";
import prisma from "../db"
import commentValidation from "../validators/commentValidation";
import { cache } from "../cache/redisCache";




export const toggleClapStory = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const userId = req.session?.user?.userId || req.user?.userId;
        
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }

        // Check if story exists and allows claps
        const story = await prisma.story.findUnique({
            where: { id },
            select: { allowClaps: true, clapCount: true }
        });

        if (!story) {
            return res.status(404).json({ error: "Story not found" });
        }

        if (!story.allowClaps) {
            return res.status(403).json({ error: "Story does not allow claps" });
        }

        // Check existing clap
        const existingClap = await prisma.clap.findUnique({
            where: {
                userId_storyId: {
                    userId,
                    storyId: id
                }
            }
        });

        let newClapStatus: boolean;
        let newClapCount: number;

        if (existingClap) {
            // Remove clap
            await prisma.clap.delete({
                where: {
                    userId_storyId: {
                        userId,
                        storyId: id
                    }
                }
            });
            newClapStatus = false;
            newClapCount = Math.max((story.clapCount || 0) - 1, 0);
        } else {
            // Add clap
            await prisma.clap.create({
                data: {
                    userId,
                    storyId: id,
                    count: 1,
                }
            });
            newClapStatus = true;
            newClapCount = (story.clapCount || 0) + 1;
        }

        // Update story clap count
        await prisma.story.update({
            where: { id },
            data: { clapCount: newClapCount }
        });

        // Clear relevant caches
        const cacheKeys = [
            `clap:status:${userId}:${id}`,
            `story:claps:${id}`,
            `story:${id}` // if you cache full story data
        ];
        
        await Promise.all(cacheKeys.map(key => cache.del(key)));

        return res.status(200).json({
            clapped: newClapStatus,
            clapCount: newClapCount,
            message: newClapStatus ? "Story clapped successfully" : "Clap removed successfully"
        });

    } catch (error: any) {
        console.error('Toggle clap error:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const getStoryClaps = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const userId = req.session?.user?.userId || req.user?.userId;
        if (!userId) {
            return res.json({
                err: "Unauthorized Access"
            })
        }
        const cacheKey = userId ? `${id}_${userId}` : id;
        const cachedData = await cache.get("story_claps", [cacheKey]);
        if (cachedData) {
            return res.status(200).json(cachedData);
        }

        const story = await prisma.story.findUnique({
            where: { id },
        })
        if (!story) {
            return res.status(404).json({ error: "Story not found" });
        }
        if (!story.allowClaps) {
            return res.status(401).json({ error: "Story does not allow claps" });
        }
        const totalClaps = await prisma.clap.aggregate({
            where: {
                storyId: id
            },
            _sum: {
                count: true
            },
            _count: {
                id: true
            }
        });
        let userClaps = null;
        if (userId) {
            userClaps = await prisma.clap.findUnique({
                where: {
                    userId_storyId: {
                        userId,
                        storyId: id
                    }
                }
            });
        }
        const recentClaps = await prisma.clap.findMany({
            where: {
                storyId: id,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            },
            take: 10
        });

        const responseData = {
            totalClaps: totalClaps._sum.count || 0,
            totalClapers: totalClaps._count.id || 0,
            userClaps: userClaps?.count || 0,
            recentClaps
        };

        await cache.set("story_claps", [cacheKey], responseData, 300);

        res.status(200).json(responseData);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

export const storyClapStatus = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const userId = req.session?.user?.userId || req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }
        const story = await prisma.story.findUnique({
            where: { id },
        })
        if (!story) {
            return res.status(404).json({ error: "Story not found" });
        }
        if (!story.allowClaps) {
            return res.status(401).json({ error: "Story does not allow claps" });
        }
        const cacheKey = `clap:status`;
        const cachedData = await cache.get(cacheKey, [userId, id]);

        const existingClap = await prisma.clap.findUnique({
            where: {
                userId_storyId: {
                    userId,
                    storyId: id
                }
            }
        });

        if (existingClap) {
            return res.status(200).json({ clap: !!existingClap });
        }
        await cache.set(cacheKey, [userId, id], { clap: false }, 60);
        res.status(200).json({ clap: false });
    } catch (error: any) {
    }
}

export const getBatchClapData = async (req: Request, res: Response): Promise<any> => {
    try {
        const {storyIds} = req.body;
        const userId = req.session?.user?.userId || req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }
        if(!Array.isArray(storyIds) || storyIds.length === 0){
            return res.status(400).json({ error: "Invalid story ids" });
        }
        if(storyIds.length > 50){
            return res.status(400).json({ error: "Too many story ids" });
        }

        const stories = await prisma.story.findMany({
            where: {
                id: {in : storyIds},
                allowClaps: true
            },
            select: {
                id: true,
                clapCount: true,
                allowClaps: true
            }
        });
        let userClaps: Record<string, boolean> = {};
        if(userId){
            const claps = await prisma.clap.findMany({
                where: {
                    userId,
                    storyId: {in: storyIds}
                },
                select: {
                    storyId: true
                }
            });

            userClaps = claps.reduce((acc, clap)=> {
                acc[clap.storyId] = true;
                return acc;
            }, {} as Record<string, boolean>);
        }
        const response = stories.reduce((acc, story)=> {
            acc[story.id] = {
                clapCount: story.clapCount || 0,
                userClapped: userClaps[story.id] || false,
                allowClaps: story.allowClaps
            };
            return acc;
        }, {} as Record<string, any>);
        return res.status(200).json(response);
    }catch (err: any){
        console.error('Batch clap data error: ', err);
        return res.status(500).json({error: "Internal Server Error"});
    }
}

export const addComment = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const userId = req.session?.user?.userId || req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }
        const story = await prisma.story.findUnique({
            where: { id },
        })
        if (!story) {
            return res.status(404).json({ error: "Story not found" });
        }
        if (!story.allowComments) {
            return res.status(401).json({ error: "Story does not allow comments" });
        }
        const { success, data } = commentValidation.safeParse(req.body);
        if (!success) {
            return res.status(400).json({ error: "Invalid comment data" });
        }
        const comment = await prisma.comment.create({
            data: {
                content: data.content,
                authorId: userId,
                storyId: id,
                parentId: data.parentId,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                        isVerified: true
                    }
                },
                _count: {
                    select: {
                        replies: true
                    }
                }
            }
        });
        const commentCount = await prisma.comment.count({
            where: {
                storyId: id
            }
        });
        await prisma.story.update({
            where: { id },
            data: {
                commentCount
            }
        });

        if (data.parentId) {
            const replyCount = await prisma.comment.count({
                where: {
                    parentId: data.parentId
                }
            });
            await prisma.comment.update({
                where: { id: data.parentId },
                data: {
                    replyCount
                }
            });
        };

        await cache.evictPattern(`story_comments:${id}:*`);

        res.status(200).json({ msg: "Comment added successfully", comment });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

export const getComments = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const userId = req.session?.user?.userId || req.user?.userId;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const cachedData = await cache.get("story_comments", [id, page.toString(), limit.toString()]);
        if (cachedData) {
            return res.status(200).json(cachedData);
        }

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }
        const story = await prisma.story.findUnique({
            where: { id },
        })
        if (!story) {
            return res.status(404).json({ error: "Story not found" });
        }
        if (!story.allowComments) {
            return res.status(401).json({ error: "Story does not allow comments" });
        }
        const comments = await prisma.comment.findMany({
            where: {
                storyId: id,
                parentId: null
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                        isVerified: true
                    }
                },
                replies: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                username: true,
                                name: true,
                                avatar: true,
                                isVerified: true
                            }
                        },
                        _count: {
                            select: {
                                replies: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 3
                },
                _count: {
                    select: {
                        replies: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limit
        });

        const totalComments = await prisma.comment.count({
            where: {
                storyId: id,
                parentId: null
            }
        });

        const responseData = {
            comments,
            pagination: {
                page,
                limit,
                total: totalComments,
                totalPages: Math.ceil(totalComments / limit),
            }
        };

        await cache.set("story_comments", [id, page.toString(), limit.toString()], responseData, 120);

        res.status(200).json(responseData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const clapComment = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const userId = req.session?.user?.userId || req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }

        const comment = await prisma.comment.findUnique({
            where: { id }
        });
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        const existingClap = await prisma.clapComment.findUnique({
            where: {
                userId_commentId: {
                    userId,
                    commentId: id
                }
            }
        });
        if (existingClap) {
            return res.status(400).json({ error: "Comment already clapped" });
        }
        const clap = await prisma.clapComment.create({
            data: {
                userId,
                commentId: id,
                count: 1,
            }
        });
        const totalClaps = await prisma.clapComment.aggregate({
            where: {
                commentId: id
            },
            _sum: {
                count: true
            }
        });
        await prisma.comment.update({
            where: { id },
            data: {
                clapCount: totalClaps._sum.count || 0,
            }
        });

        await cache.evictPattern(`story_comments:${comment.storyId}:*`);

        res.status(200).json({ msg: "Comment clapped successfully" });
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
}

export const removeClapComment = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const userId = req.session?.user?.userId || req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }
        const comment = await prisma.comment.findUnique({
            where: { id }
        });
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }
        await prisma.clapComment.delete({
            where: {
                userId_commentId: {
                    userId,
                    commentId: id
                }
            }
        });
        const commentCount = await prisma.comment.count({
            where: {
                storyId: comment.storyId
            }
        });
        await prisma.story.update({
            where: {
                id: comment.storyId
            },
            data: {
                commentCount
            }
        });
        await cache.evictPattern(`story_comments:${comment.storyId}:*`);
        res.status(200).json({ msg: "Comment clapped successfully" });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

export const updateComment = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const userId = req.session?.user?.userId || req.user?.userId;
        const { content } = req.body;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }
        if (!content) {
            return res.status(400).json({ error: "Comment content is required" });
        }

        const comment = await prisma.comment.findUnique({
            where: {
                id
            }
        });
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }
        if (comment.authorId !== userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }

        const updatedComment = await prisma.comment.update({
            where: { id },
            data: {
                content,
                isEdited: true,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                        isVerified: true
                    }
                }
            }
        });

        await cache.evictPattern(`story_comments:${comment.storyId}:*`);

        res.status(200).json({ comment: updatedComment });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

export const deleteComment = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const userId = req.session?.user?.userId || req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }
        const comment = await prisma.comment.findUnique({
            where: { id }
        });
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }
        const isCommentAuthor = comment.authorId === userId;
        const isStoryOwner = comment.storyId === userId;
        if (!isCommentAuthor && !isStoryOwner) {
            return res.status(401).json({
                error: "Unauthorized Access"
            })
        };

        await prisma.comment.delete({
            where: {
                id
            }
        });

        const commentCount = await prisma.comment.count({
            where: {
                storyId: comment.storyId
            }
        });
        await prisma.story.update({
            where: {
                id: comment.storyId
            },
            data: {
                commentCount
            }
        });

        if (comment.parentId) {
            const replyCount = await prisma.comment.count({
                where: {
                    parentId: comment.parentId
                }
            });
            await prisma.comment.update({
                where: {
                    id: comment.parentId
                },
                data: {
                    replyCount
                }
            });
        }

        await cache.evictPattern(`story_comments:${comment.storyId}:*`);

        res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

export const replycomment = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const userId = req.session?.user?.userId || req.user?.userId;
        const { content } = req.body;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }
        if (!content) {
            return res.status(400).json({ error: "Comment content is required" });
        }

        const parentComment = await prisma.comment.findUnique({
            where: { id },
            include: {
                story: true
            }
        });
        if (!parentComment) {
            return res.status(404).json({ error: "Comment not found" });
        }
        if (!parentComment.story.allowComments) {
            return res.status(401).json({ error: "Story does not allow comments" });
        }

        const reply = await prisma.comment.create({
            data: {
                content,
                parentId: id,
                authorId: userId,
                storyId: parentComment.storyId
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                        isVerified: true
                    }
                }
            }
        });

        const replyCount = await prisma.comment.count({
            where: {
                parentId: id
            }
        });
        await prisma.comment.update({
            where: { id },
            data: { replyCount }
        })

        const totalReplyCount = await prisma.comment.count({
            where: {
                storyId: parentComment.storyId,
                parentId: null
            }
        });
        await prisma.story.update({
            where: { id: parentComment.storyId },
            data: {
                commentCount: totalReplyCount
            }
        });

        await cache.evictPattern(`story_comments:${parentComment.storyId}:*`);

        res.status(200).json({ comment: reply });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

export const followUser = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const userId = req.session?.user?.userId || req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }

        if (userId === id) {
            return res.status(400).json({ error: "You cannot follow yourself" });
        }

        const userToFollow = await prisma.user.findUnique({
            where: { id }
        });

        if (!userToFollow) {
            return res.status(404).json({ error: "User not found" });
        }

        const existingFollow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: userId,
                    followingId: id
                }
            }
        });

        if (existingFollow) {
            res.status(200).json({ error: "You are already following this user" });
        }

        await prisma.follow.create({
            data: {
                followerId: userId,
                followingId: id
            },
            include: {
                following: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                        isVerified: true
                    }
                }
            }
        });

        await cache.evictPattern(`user_followers:${id}:*`);
        await cache.evictPattern(`user_following:${userId}:*`);
        await cache.evict("user_follow_status", [userId, id]);

        res.status(200).json({ msg: "Followed successfully" });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

export const followStatus = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const userId = req.session?.user?.userId || req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }

        const existingFollow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: userId,
                    followingId: id
                }
            }
        });

        if (existingFollow) {
            return res.status(200).json({ following: !!existingFollow });
        }

        res.status(200).json({ following: false });
    } catch (error: any) {
    }
}

export const unfollowUser = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const userId = req.session?.user?.userId || req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }

        await prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId: userId,
                    followingId: id
                }
            }
        });

        await cache.evictPattern(`user_followers:${id}:*`);
        await cache.evictPattern(`user_following:${userId}:*`);
        await cache.evict("user_follow_status", [userId, id]);

        res.status(200).json({ msg: "Unfollowed successfully" });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

export const getUserFollowers = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const userId = req.session?.user?.userId || req.user?.userId;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const cachedData = await cache.get("user_followers", [id, page.toString(), limit.toString()]);
        if (cachedData) {
            return res.status(200).json(cachedData);
        }

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }

        const user = await prisma.user.findUnique({
            where: { id }
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const followers = await prisma.follow.findMany({
            where: {
                followingId: id
            },
            include: {
                follower: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                        isVerified: true,
                        bio: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limit
        });

        const totalFollowers = await prisma.follow.count({
            where: {
                followingId: id
            }
        });

        const responseData = {
            followers,
            pagination: {
                page,
                limit,
                total: totalFollowers,
                totalPages: Math.ceil(totalFollowers / limit),
            }
        };

        await cache.set("user_followers", [id, page.toString(), limit.toString()], responseData, 600);

        res.status(200).json(responseData);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

export const getUserFollowing = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const userId = req.session?.user?.userId || req.user?.userId;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const cachedData = await cache.get("user_following", [id, page.toString(), limit.toString()]);
        if (cachedData) {
            return res.status(200).json(cachedData);
        }

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }

        const user = await prisma.user.findUnique({
            where: { id }
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const following = await prisma.follow.findMany({
            where: { followerId: id },
            include: {
                following: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                        isVerified: true,
                        bio: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limit
        });
        const totalFollowing = await prisma.follow.count({
            where: { followerId: id }
        });

        const responseData = {
            following,
            pagination: {
                page,
                limit,
                total: totalFollowing,
                totalPages: Math.ceil(totalFollowing / limit),
            }
        };

        await cache.set("user_following", [id, page.toString(), limit.toString()], responseData, 600);

        res.status(200).json(responseData);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

export const bookmarkStory = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const userId = req.session?.user?.userId || req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" })
        }

        const story = await prisma.story.findUnique({
            where: { id }
        });
        if (!story) {
            return res.status(404).json({ error: "Story not found" });
        }

        const existingBookmark = await prisma.bookmark.findUnique({
            where: {
                userId_storyId: {
                    userId,
                    storyId: id
                }
            }
        });

        if (existingBookmark) {
            return res.status(400).json({ error: "Story already bookmarked" });
        }

        await prisma.bookmark.create({
            data: {
                userId,
                storyId: id,
            },
            include: {
                story: {
                    select: {
                        id: true,
                        title: true,
                        subtitle: true,
                        excerpt: true,
                        coverImage: true,
                        slug: true,
                        readTime: true,
                        author: {
                            select: {
                                id: true,
                                username: true,
                                name: true,
                                avatar: true,
                            }
                        }
                    }
                }
            }
        });
        const bookmarkCount = await prisma.bookmark.count({
            where: {
                storyId: id
            }
        });
        await prisma.story.update({
            where: { id },
            data: {
                bookmarkCount
            }
        });

        await cache.evictPattern(`user_bookmarks:${userId}:*`);
        await cache.evict("user_bookmark_status", [userId, id]);

        res.status(200).json({ msg: "Story bookmarked successfully" });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

export const removeBookmark = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const userId = req.session?.user?.userId || req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" })
        }
        await prisma.bookmark.delete({
            where: {
                userId_storyId: {
                    userId,
                    storyId: id
                }
            }
        });

        const bookmarkCount = await prisma.bookmark.count({
            where: {
                storyId: id
            }
        });
        await prisma.story.update({
            where: { id },
            data: {
                bookmarkCount
            }
        });

        await cache.evictPattern(`user_bookmarks:${userId}:*`);
        await cache.evict("user_bookmark_status", [userId, id]);

        res.status(200).json({ msg: "Bookmark removed successfully" });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

export const getUserBookmarks = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const userId = req.session?.user?.userId || req.user?.userId;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const cachedData = await cache.get("user_bookmarks", [userId || 'anonymous', page.toString(), limit.toString()]);
        if (cachedData) {
            return res.status(200).json(cachedData);
        }

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }

        const bookmarks = await prisma.bookmark.findMany({
            where: { userId },
            include: {
                story: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                username: true,
                                name: true,
                                avatar: true,
                                isVerified: true,
                            }
                        },
                        publication: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                logo: true,
                            }
                        },
                        tags: {
                            include: {
                                tag: {
                                    select: {
                                        id: true,
                                        name: true,
                                        slug: true,
                                    }
                                }
                            }
                        },
                        _count: {
                            select: {
                                claps: true,
                                comments: true,
                                bookmarks: true,
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limit
        });

        const totalBookmarks = await prisma.bookmark.count({
            where: { userId }
        });

        const responseData = {
            bookmarks,
            pagination: {
                page,
                limit,
                total: totalBookmarks,
                totalPages: Math.ceil(totalBookmarks / limit),
            }
        };

        await cache.set("user_bookmarks", [userId, page.toString(), limit.toString()], responseData, 900);

        res.status(200).json(responseData);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

export const contentSearch = async (req: Request, res: Response): Promise<any> => {
    try {
        const { q } = req.query as { q?: string };

        if (!q || q.trim().length === 0) {
            return res.status(400).json({ error: "Search query is required" });
        }

        const searchTerm = q.trim();

        const [stories, people, publications, topics] = await Promise.all([
            prisma.story.findMany({
                where: {
                    OR: [
                        {
                            title: {
                                contains: searchTerm,
                                mode: "insensitive"
                            }
                        },
                        {
                            excerpt: {
                                contains: searchTerm,
                                mode: "insensitive"
                            }
                        },
                        {
                            content: {
                                contains: searchTerm,
                                mode: "insensitive"
                            }
                        }
                    ],
                    status: 'PUBLISHED' 
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            avatar: true
                        }
                    },
                    tags: {
                        select: {
                            tag: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                },
                orderBy: [
                    { publishedAt: 'desc' },
                    { createdAt: 'desc' }
                ],
                take: 20
            }),

            prisma.user.findMany({
                where: {
                    OR: [
                        {
                            name: {
                                contains: searchTerm,
                                mode: "insensitive"
                            }
                        },
                        {
                            username: {
                                contains: searchTerm,
                                mode: "insensitive"
                            }
                        },
                        {
                            bio: {
                                contains: searchTerm,
                                mode: "insensitive"
                            }
                        }
                    ]
                },
                select: {
                    id: true,
                    name: true,
                    username: true,
                    avatar: true,
                    bio: true,
                    isVerified: true,
                    _count: {
                        select: {
                            followers: true
                        }
                    }
                },
                orderBy: [
                    { 
                        followers: {
                            _count: 'desc'
                        }
                    },
                    { createdAt: 'desc' }
                ],
                take: 20
            }),

            prisma.publication.findMany({
                where: {
                    OR: [
                        {
                            name: {
                                contains: searchTerm,
                                mode: "insensitive"
                            }
                        },
                        {
                            description: {
                                contains: searchTerm,
                                mode: "insensitive"
                            }
                        }
                    ]
                },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    description: true,
                    coverImage: true, 
                    _count: {
                        select: {
                            subscribers: true 
                        }
                    }
                },
                orderBy: [
                    { 
                        subscribers: {
                            _count: 'desc'
                        }
                    },
                    { createdAt: 'desc' }
                ],
                take: 20
            }),

            prisma.tag.findMany({
                where: {
                    OR: [
                        {
                            name: {
                                contains: searchTerm,
                                mode: "insensitive"
                            }
                        },
                        {
                            description: {
                                contains: searchTerm,
                                mode: "insensitive"
                            }
                        }
                    ]
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    _count: {
                        select: {
                            stories: true
                        }
                    }
                },
                orderBy: [
                    { 
                        stories: {
                            _count: 'desc'
                        }
                    },
                    { createdAt: 'desc' }
                ],
                take: 20
            })
        ]);

        // Transform the data to match the expected format
        const transformedResults = {
            stories: stories.map(story => ({
                id: story.id,
                title: story.title,
                excerpt: story.excerpt,
                slug: story.slug,
                publishedAt: story.publishedAt,
                readTime: story.readTime,
                image: story.coverImage,
                author: {
                    name: story.author.name,
                    username: story.author.username,
                    avatar: story.author.avatar
                },
                tags: story.tags.map(t => t.tag.name)
            })),
            people: people.map(person => ({
                id: person.id,
                name: person.name,
                username: person.username,
                avatar: person.avatar,
                bio: person.bio,
                isVerified: person.isVerified,
                followerCount: person._count.followers
            })),
            publications: publications.map(pub => ({
                id: pub.id,
                name: pub.name,
                slug: pub.slug,
                description: pub.description,
                image: pub.coverImage, 
                followerCount: pub._count.subscribers 
            })),
            topics: topics.map(topic => ({
                id: topic.id,
                name: topic.name,
                description: topic.description,
                storyCount: topic._count.stories
            }))
        };

        return res.status(200).json(transformedResults);

    } catch (err: any) {
        console.error("Error while searching", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};