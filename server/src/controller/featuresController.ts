import { Request, response, Response, Router } from "express";
import prisma from "../db"
import commentValidation from "../validators/commentValidation";
import { cache } from "../cache/redisCache";
import { JsonWebTokenError } from "jsonwebtoken";
import { promise } from "zod";




export const toggleClapStory = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const userId = req.session?.user?.userId || req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }

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

        await prisma.story.update({
            where: { id },
            data: { clapCount: newClapCount }
        });

        const cacheKeys = [
            `clap:status:${userId}:${id}`,
            `story:claps:${id}`,
            `story:${id}`
        ];

        await Promise.all(cacheKeys.map(key => cache.evictPattern(key)));

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

export const getStoryClapData = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const userId = req.session?.user?.userId || req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }

        const cacheKey = `story:claps:${id}`;
        const cachedData = await cache.get(cacheKey, [userId ? userId : '']);

        if (cachedData) {
            return res.status(200).json(JSON.parse(cachedData));
        }

        const story = await prisma.story.findUnique({
            where: { id },
            select: {
                allowClaps: true,
                clapCount: true,
                id: true
            }
        });

        if (!story) {
            return res.status(404).json({ error: "Story not found" });
        }

        if (!story.allowClaps) {
            return res.status(403).json({ error: "Story does not allow claps" });
        }

        // Get user's clap status if authenticated
        let userClapped = false;
        if (userId) {
            const userClap = await prisma.clap.findUnique({
                where: {
                    userId_storyId: {
                        userId,
                        storyId: id
                    }
                }
            });
            userClapped = !!userClap;
        }

        const responseData = {
            clapCount: story.clapCount || 0,
            userClapped,
            allowClaps: story.allowClaps
        };


        await cache.set(cacheKey, [JSON.stringify(responseData)], 300);
        return res.status(200).json(responseData);

    } catch (error: any) {
        console.error('Get clap data error:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


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

export const toggleCommentClap = async (req: Request, res: Response): Promise<any> => {
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
        let newClapStatus: boolean;
        let newClapCount: number;
        if (existingClap) {
            await prisma.clapComment.delete({
                where: {
                    userId_commentId: {
                        userId,
                        commentId: id
                    }
                }
            });
            newClapStatus = false;
            newClapCount = Math.max((comment.clapCount || 0) - 1, 0);
        } else {
            await prisma.clapComment.create({
                data: {
                    userId,
                    commentId: id,
                    count: 1
                }
            });
            newClapStatus = true;
            newClapCount = (comment.clapCount || 0) + 1;
        }
        await prisma.comment.update({
            where: { id },
            data: { clapCount: newClapCount }
        });

        const cacheKeys = [
            `clap:status:${userId}:${id}`,
            `comment:claps:${id}`,
            `comment:${id}`
        ];

        await Promise.all(cacheKeys.map(key => cache.evictPattern(key)));

        return res.status(200).json({
            clapped: newClapStatus,
            clapCount: newClapCount,
            message: newClapStatus ? "Comment clapped successfully" : "Clap removed successfully"
        });
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
}

export const getBatchCommentClapData = async (req: Request, res: Response): Promise<any> => {
    try {
        const { commentIds } = req.body;
        const userId = req.session?.user?.userId || req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }

        if (!Array.isArray(commentIds) || commentIds.length === 0) {
            return res.status(400).json({ error: "Invalid comment ids" });
        }

        const comments = await prisma.comment.findMany({
            where: { id: { in: commentIds } },
            select: { id: true, clapCount: true }
        });

        
        const userClaps = await prisma.clapComment.findMany({
            where: {
                userId,
                commentId: { in: commentIds }
            },
            select: { commentId: true }
        });

        const userClapSet = new Set(userClaps.map(c => c.commentId));

        const response = comments.reduce((acc, c) => {
            acc[c.id] = {
                clapCount: c.clapCount || 0,
                userClap: userClapSet.has(c.id)
            };
            return acc;
        }, {} as Record<string, { clapCount: number; userClap: boolean }>);

        return res.status(200).json(response);
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};

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


export const toggleUserFollow = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const userId = req.session?.user?.userId || req.user?.userId;
        console.log("userId", userId, id);
        console.log("toogleUserFollow", req.session?.user);
        console.log("toogleUserFollow 2", req.user);

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }
        if (userId === id) {
            return res.status(401).json({ error: "You cannot follow yourself" });
        }

        const existingFollow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: userId,
                    followingId: id,
                },
            },
        });

        let newFollowStatus: boolean;
        let updatedCounts;

        if (existingFollow) {
            // unfollow
            await prisma.follow.delete({
                where: {
                    followerId_followingId: {
                        followerId: userId,
                        followingId: id,
                    },
                },
            });

            updatedCounts = await Promise.all([
                prisma.user.update({
                    where: { id: userId },
                    data: { followingCount: { decrement: 1 } },
                    select: { followingCount: true },
                }),
                prisma.user.update({
                    where: { id },
                    data: { followersCount: { decrement: 1 } },
                    select: { followersCount: true },
                }),
            ]);

            newFollowStatus = false;
        } else {
            await prisma.follow.create({
                data: {
                    followerId: userId,
                    followingId: id,
                },
            });

            updatedCounts = await Promise.all([
                prisma.user.update({
                    where: { id: userId },
                    data: { followingCount: { increment: 1 } },
                    select: { followingCount: true },
                }),
                prisma.user.update({
                    where: { id },
                    data: { followersCount: { increment: 1 } },
                    select: { followersCount: true },
                }),
            ]);

            newFollowStatus = true;
        }

        const cacheKey = [
            `follow:status:${userId}:${id}`,
            `follow:data:${id}`,
            `user:followers:${id}`,
            `user:following:${userId}`,
            `user:${id}`,
            `user:${userId}`,
        ];
        await Promise.all(cacheKey.map((key) => cache.evictPattern(key)));

        return res.status(200).json({
            following: newFollowStatus,
            followerCount: updatedCounts[1].followersCount,
            followingCount: updatedCounts[0].followingCount,
            msg: newFollowStatus ? "Followed successfully" : "Unfollowed successfully",
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

export const getUserFollowData = async (req: Request, res: Response): Promise<any> => {
    try {
        console.log("calling getUserFollowData");
        const { id } = req.params;
        const userId = req.session?.user?.userId || req.user?.userId;
        if(!userId){
            return res.status(401).json({error: "Unauthorized Accesss"});
        }

        const cacheKey = `follow:data:${id}:${userId}`;
        const cachedData = await cache.get(cacheKey, []);

        if (cachedData) {
            return res.status(200).json(cachedData);
        }

        const user = await prisma.user.findUnique({
            where: { id },
            select: { id: true }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const [followersCount, followingCount] = await Promise.all([
            prisma.follow.count({
                where: { followingId: id }
            }),
            prisma.follow.count({
                where: { followerId: id }
            })
        ]);

        let isFollowing = false;
        if (userId && userId !== id) {
            const followRelation = await prisma.follow.findUnique({
                where: {
                    followerId_followingId: {
                        followerId: userId,
                        followingId: id
                    }
                }
            });
            isFollowing = !!followRelation;
        }

        const responseData = {
            followersCount,
            followingCount,
            isFollowing,
            canFollow: !!userId && userId !== id
        };

        await cache.set(cacheKey, [JSON.stringify(responseData)], 300);
        console.log("responseData", responseData);
        return res.status(200).json(responseData);

    } catch (error: any) {
        console.error('Get follow data error:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const getBatchFollowData = async (req: Request, res: Response): Promise<any> => {
    try {
        const { userIds } = req.body;
        const currentUserId = req.session?.user?.userId || req.user?.userId;

        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ error: "Invalid user IDs" });
        }

        if (userIds.length > 50) {
            return res.status(400).json({ error: "Too many user IDs (max 50)" });
        }

        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true }
        });

        const existingUserIds = users.map(u => u.id);

        const followersData = await prisma.follow.groupBy({
            by: ['followingId'],
            where: {
                followingId: { in: existingUserIds }
            },
            _count: {
                followingId: true
            }
        });

        const followingData = await prisma.follow.groupBy({
            by: ['followerId'],
            where: {
                followerId: { in: existingUserIds }
            },
            _count: {
                followerId: true
            }
        });

        let followingRelations: Record<string, boolean> = {};
        if (currentUserId) {
            const follows = await prisma.follow.findMany({
                where: {
                    followerId: currentUserId,
                    followingId: { in: existingUserIds }
                },
                select: { followingId: true }
            });

            followingRelations = follows.reduce((acc, follow) => {
                acc[follow.followingId] = true;
                return acc;
            }, {} as Record<string, boolean>);
        }

        const followersMap = followersData.reduce((acc, item) => {
            acc[item.followingId] = item._count.followingId;
            return acc;
        }, {} as Record<string, number>);

        const followingMap = followingData.reduce((acc, item) => {
            acc[item.followerId] = item._count.followerId;
            return acc;
        }, {} as Record<string, number>);

        const responseData = existingUserIds.reduce((acc, userId) => {
            acc[userId] = {
                followersCount: followersMap[userId] || 0,
                followingCount: followingMap[userId] || 0,
                isFollowing: followingRelations[userId] || false,
                canFollow: currentUserId && currentUserId !== userId
            };
            return acc;
        }, {} as Record<string, any>);

        return res.status(200).json(responseData);

    } catch (error: any) {
        console.error('Batch follow data error:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const toggleStoryBookmark = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const userId = req.session?.user?.userId || req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }

        const story = await prisma.story.findUnique({
            where: { id },
            select: { id: true }
        });

        if (!story) {
            return res.status(404).json({ error: "Story not found" });
        }

        const existingBookmark = await prisma.bookmark.findUnique({
            where: { userId_storyId: { userId, storyId: id } }
        });

        let newBookmarkStatus: boolean;

        if (existingBookmark) {
            await prisma.$transaction(async (tx) => {
                await tx.bookmark.delete({
                    where: { userId_storyId: { userId, storyId: id } }
                });

                await Promise.all([
                    tx.story.update({
                        where: { id },
                        data: { bookmarkCount: { decrement: 1 } }
                    }),
                    tx.user.update({
                        where: { id: userId },
                        data: { bookmarkCount: { decrement: 1 } }
                    })
                ]);
            });

            newBookmarkStatus = false;
        } else {
            await prisma.$transaction(async (tx) => {
                await tx.bookmark.create({
                    data: { userId, storyId: id }
                });

                await Promise.all([
                    tx.story.update({
                        where: { id },
                        data: { bookmarkCount: { increment: 1 } }
                    }),
                    tx.user.update({
                        where: { id: userId },
                        data: { bookmarkCount: { increment: 1 } }
                    })
                ]);
            });

            newBookmarkStatus = true;
        }

        const [updatedStory, updatedUser] = await Promise.all([
            prisma.story.findUnique({
                where: { id },
                select: { bookmarkCount: true }
            }),
            prisma.user.findUnique({
                where: { id: userId },
                select: { bookmarkCount: true }
            })
        ]);

        const cacheKeys = [
            `bookmark:status:${userId}:${id}`,
            `bookmark:data:${id}`,
            `story:bookmarks:${id}`,
            `user:bookmarks:${userId}`,
            `story:${id}`,
            `user:${userId}`
        ];
        await Promise.all(cacheKeys.map(key => cache.evictPattern(key)));

        return res.status(200).json({
            bookmarked: newBookmarkStatus,
            storyBookmarkCount: updatedStory?.bookmarkCount || 0,
            userBookmarkCount: updatedUser?.bookmarkCount || 0,
            message: newBookmarkStatus
                ? "Story bookmarked successfully"
                : "Bookmark removed successfully"
        });

    } catch (error: any) {
        console.error("Toggle bookmark error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


export const populateFollowCounts = async () => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true }
        });

        for (const user of users) {
            const [followersCount, followingCount] = await Promise.all([
                prisma.follow.count({
                    where: { followingId: user.id }
                }),
                prisma.follow.count({
                    where: { followerId: user.id }
                })
            ]);

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    followersCount,
                    followingCount
                }
            });
        }

        console.log('Follow counts populated successfully');
    } catch (error) {
        console.error('Error populating follow counts:', error);
    }
};


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


export const getBatchStoryMetaData = async (req: Request, res: Response): Promise<any> => {
    try {
        const { ids } = req.body;
        const userId = req.session?.user?.userId || req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: "Invalid story ids" });
        }
        if (ids.length > 50) {
            return res.status(400).json({ error: "Too many story ids" });
        }

        const storyIds = [...new Set(ids as string[])];

        const stories = await prisma.story.findMany({
            where: {
                id: { in: storyIds },
            },
            select: {
                id: true,
                clapCount: true,
                allowClaps: true,
            }
        });

        const claps = await prisma.clap.findMany({
            where: {
                userId,
                storyId: { in: storyIds }
            },
            select: { storyId: true }
        });

        const userClaps = claps.reduce((acc, clap) => {
            acc[clap.storyId] = true;
            return acc;
        }, {} as Record<string, boolean>);

        const bookmarks = await prisma.bookmark.findMany({
            where: {
                userId,
                storyId: { in: storyIds }
            },
            select: { storyId: true }
        });

        const userBookmarks = bookmarks.reduce((acc, bm) => {
            acc[bm.storyId] = true;
            return acc;
        }, {} as Record<string, boolean>);

        const response = stories.reduce((acc, story) => {
            acc[story.id] = {
                clapCount: story.clapCount || 0,
                userClapped: userClaps[story.id] || false,
                allowClaps: story.allowClaps,
                bookmarked: userBookmarks[story.id] || false
            };
            return acc;
        }, {} as Record<string, any>);

        return res.status(200).json(response);
    } catch (err: any) {
        console.error('Batch story metadata error:', err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
