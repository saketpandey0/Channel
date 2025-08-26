import { Request, response, Response, Router } from "express";
import prisma from "../db"
import commentValidation from "../validators/commentValidation";
import { cache } from "../cache/redisCache";




export const clapStory = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session.user?.userId || req.user?.userId;
        const user = req.user;
        console.log("user logging:", user);
        console.log("logging userId:", userId);
        console.log("req.user:", req.user);
        console.log("req.session.user:", (req.session as any)?.user);

        if(!userId){
            return res.status(401).json({error: "Unauthorized Access"});
        }
        const story = await prisma.story.findUnique({
            where: {id},
        })
        if(!story){
            return res.status(404).json({error: "Story not found"});
        }
        if(!story.allowClaps){
            return res.status(401).json({error: "Story does not allow claps"});
        }

        const existingClap = await prisma.clap.findUnique({
            where: {
                userId_storyId: {
                    userId,
                    storyId: id
                }
            }
        });
        if(existingClap){
            console.log("clapped Already")
            return res.status(400).json({err: "Story already clapped"});
        }
        const clap = await prisma.clap.create({
            data: {
                userId,
                storyId: id,
                count: 1,
            }
        });
        const totalClaps = await prisma.clap.aggregate({
            where: {
                storyId: id
            },
            _sum: {
                count: true
            }
        });
        await prisma.story.update({
            where: {id},
            data: {
                clapCount: totalClaps._sum.count || 0,
            }
        });

        await cache.evict("story_claps", [id]);
        await cache.evict("user_clapped", [userId, id]);

        res.status(200).json({msg: "Story clapped successfully"});
        console.log("clapping")
    } catch(error: any){
        console.error(error);
        res.status(500).json({error: error.message});
    }
}

export const removeClap =  async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session?.user?.userId || req.user?.userId ;
        if(!userId){
            return res.status(401).json({error: "Unauthorized Access"});
        }
        const story = await prisma.story.findUnique({
            where: {id},
        })
        if(!story){
            return res.status(404).json({error: "Story not found"});
        }
        if(!story.allowClaps){
            return res.status(401).json({error: "Story does not allow claps"});
        }

        await prisma.clap.delete({
            where: {
                userId_storyId: {
                    userId,
                    storyId: id
                }
            }
        });
        const totalClaps = await prisma.clap.aggregate({
            where: {
                storyId: id
            },
            _sum: {
                count: true
            }
        });
        await prisma.story.update({
            where: {id},
            data: {
                clapCount: totalClaps._sum.count || 0,
            }
        });

        await cache.evict("story_claps", [id]);
        await cache.evict("user_clapped", [userId, id]);

        res.status(200).json({msg: "Clap removed successfully"});
    } catch(error: any){
        console.error(error);
        res.status(500).json({error: error.message});
    }
}

export const getStoryClaps = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session?.user?.userId || req.user?.userId ;
        if(!userId){
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
            where: {id},
        })
        if(!story){
            return res.status(404).json({error: "Story not found"});
        }
        if(!story.allowClaps){
            return res.status(401).json({error: "Story does not allow claps"});
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
        if(userId){
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
    } catch(error: any){
        console.error(error);
        res.status(500).json({error: error.message});
    }
}

export const storyClapStatus = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session?.user?.userId || req.user?.userId ;
        if(!userId){
            return res.status(401).json({error: "Unauthorized Access"});
        }
        const story = await prisma.story.findUnique({
            where: {id},
        })
        if(!story){
            return res.status(404).json({error: "Story not found"});
        }
        if(!story.allowClaps){
            return res.status(401).json({error: "Story does not allow claps"});
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

        if(existingClap){
            return res.status(200).json({clap: !!existingClap});
        }
        await cache.set(cacheKey, [userId, id], {clap: false}, 60);
        res.status(200).json({clap: false});
    } catch(error: any){
    }
}

export const addComment = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session?.user?.userId || req.user?.userId ;
        if(!userId){
            return res.status(401).json({error: "Unauthorized Access"});
        }
        const story = await prisma.story.findUnique({
            where: {id},
        })
        if(!story){
            return res.status(404).json({error: "Story not found"});
        }
        if(!story.allowComments){
            return res.status(401).json({error: "Story does not allow comments"});
        }
        const {success, data} = commentValidation.safeParse(req.body);
        if(!success){
            return res.status(400).json({error: "Invalid comment data"});
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
            where: {id},
            data: {
                commentCount
            }
        });

        if(data.parentId){
            const replyCount = await prisma.comment.count({
                where: {
                    parentId: data.parentId
                }
            });
            await prisma.comment.update({
                where: {id: data.parentId},
                data: {
                    replyCount
                }
            });
        };

        await cache.evictPattern(`story_comments:${id}:*`);

        res.status(200).json({msg: "Comment added successfully", comment});
    } catch(error: any){
        console.error(error);
        res.status(500).json({error: error.message});
    }
}

export const getComments = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session?.user?.userId || req.user?.userId ;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
        
        const cachedData = await cache.get("story_comments", [id, page.toString(), limit.toString()]);
        if (cachedData) {
            return res.status(200).json(cachedData);
        }

        if(!userId){
            return res.status(401).json({error: "Unauthorized Access"});
        }
        const story = await prisma.story.findUnique({
            where: {id},
        })
        if(!story){
            return res.status(404).json({error: "Story not found"});
        }
        if(!story.allowComments){
            return res.status(401).json({error: "Story does not allow comments"});
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
        const {id} = req.params;
        const userId = req.session?.user?.userId || req.user?.userId ;
        if(!userId){
            return res.status(401).json({error: "Unauthorized Access"});
        }

        const comment = await prisma.comment.findUnique({
            where: {id}
        });
        if(!comment){
            return res.status(404).json({error: "Comment not found"});
        }

        const existingClap = await prisma.clapComment.findUnique({
            where: {
                userId_commentId: {
                    userId,
                    commentId: id
                }
            }
        });
        if(existingClap){
            return res.status(400).json({error: "Comment already clapped"});
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
            where: {id},
            data: {
                clapCount: totalClaps._sum.count || 0,
            }
        });

        await cache.evictPattern(`story_comments:${comment.storyId}:*`);

        res.status(200).json({msg: "Comment clapped successfully"});
    } catch(error: any){
        console.error(error);
        return res.status(500).json({error: error.message});
    }
}

export const removeClapComment = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session?.user?.userId || req.user?.userId ;
        if(!userId){
            return res.status(401).json({error: "Unauthorized Access"});
        }       
        const comment = await prisma.comment.findUnique({
            where: {id}
        });
        if(!comment){
            return res.status(404).json({error: "Comment not found"});
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
        res.status(200).json({msg: "Comment clapped successfully"});
    } catch(error: any){
        console.error(error);
        res.status(500).json({error: error.message});
    }
}

export const updateComment = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session?.user?.userId || req.user?.userId ;
        const {content} = req.body;     

        if(!userId){
            return res.status(401).json({error: "Unauthorized Access"});
        }
        if(!content){
            return res.status(400).json({error: "Comment content is required"});
        }

        const comment = await prisma.comment.findUnique({
            where: {
                id
            }
        });
        if(!comment){
            return res.status(404).json({error: "Comment not found"});
        }
        if(comment.authorId !== userId){
            return res.status(401).json({error: "Unauthorized Access"});
        }

        const updatedComment = await prisma.comment.update({
            where: {id},
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

        res.status(200).json({comment: updatedComment});
    } catch(error: any){
        console.error(error);
        res.status(500).json({error: error.message});
    }
}

export const deleteComment = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session?.user?.userId || req.user?.userId ;

        if(!userId){
            return res.status(401).json({error: "Unauthorized Access"});
        }
        const comment = await prisma.comment.findUnique({
            where: {id}
        });
        if(!comment){
            return res.status(404).json({error: "Comment not found"});
        }
        const isCommentAuthor = comment.authorId === userId;
        const isStoryOwner = comment.storyId === userId;
        if(!isCommentAuthor && !isStoryOwner){
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

        if(comment.parentId){
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

        res.status(200).json({message: "Comment deleted successfully"});
    } catch(error: any){
        console.error(error);
        res.status(500).json({error: error.message});
    }
}

export const replycomment = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session?.user?.userId || req.user?.userId ;
        const {content} = req.body;

        if(!userId){
            return res.status(401).json({error: "Unauthorized Access"});
        }
        if(!content){
            return res.status(400).json({error: "Comment content is required"});
        }
        
        const parentComment = await prisma.comment.findUnique({
            where: {id},
            include: {
                story: true
            }
        });
        if(!parentComment){
            return res.status(404).json({error: "Comment not found"});
        }
        if(!parentComment.story.allowComments){
            return res.status(401).json({error: "Story does not allow comments"});
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
            where: {id},
            data: {replyCount}
        })

        const totalReplyCount = await prisma.comment.count({
            where: {
                storyId: parentComment.storyId,
                parentId: null
            }
        });
        await prisma.story.update({
            where: {id: parentComment.storyId},
            data: {
                commentCount: totalReplyCount
            }
        });

        await cache.evictPattern(`story_comments:${parentComment.storyId}:*`);

        res.status(200).json({comment: reply});
    } catch(error: any){
        console.error(error);
        res.status(500).json({error: error.message});
    }
}

export const followUser = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session?.user?.userId || req.user?.userId ;
        if(!userId){
            return res.status(401).json({error: "Unauthorized Access"});
        }

        if(userId === id){
            return res.status(400).json({error: "You cannot follow yourself"});
        }

        const userToFollow = await prisma.user.findUnique({
            where: {id}
        });

        if(!userToFollow){
            return res.status(404).json({error: "User not found"});
        }

        const existingFollow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: userId,
                    followingId: id
                }
            }
        });

        if(existingFollow){
            res.status(200).json({error: "You are already following this user"});
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

        res.status(200).json({msg: "Followed successfully"});
    } catch(error: any){
        console.error(error);
        res.status(500).json({error: error.message});
    }
}

export const followStatus = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session?.user?.userId || req.user?.userId ;
        if(!userId){
            return res.status(401).json({error: "Unauthorized Access"});
        }

        const existingFollow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: userId,
                    followingId: id
                }
            }
        });

        if(existingFollow){
            return res.status(200).json({following: !!existingFollow});
        }

        res.status(200).json({following: false});
    } catch(error: any){
    }
}

export const unfollowUser = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session?.user?.userId || req.user?.userId ;
        if(!userId){
            return res.status(401).json({error: "Unauthorized Access"});
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

        res.status(200).json({msg: "Unfollowed successfully"});
    } catch(error: any){
        console.error(error);
        res.status(500).json({error: error.message});   
    }
}

export const getUserFollowers = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session?.user?.userId || req.user?.userId ;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const cachedData = await cache.get("user_followers", [id, page.toString(), limit.toString()]);
        if (cachedData) {
            return res.status(200).json(cachedData);
        }

        if(!userId){
            return res.status(401).json({error: "Unauthorized Access"});
        }

        const user = await prisma.user.findUnique({
            where: {id}
        });
        if(!user){
            return res.status(404).json({error: "User not found"});
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
    } catch(error: any){
        console.error(error);
        res.status(500).json({error: error.message});
    }
}

export const getUserFollowing = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session?.user?.userId || req.user?.userId ;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const cachedData = await cache.get("user_following", [id, page.toString(), limit.toString()]);
        if (cachedData) {
            return res.status(200).json(cachedData);
        }

        if (!userId) {      
            return res.status(401).json({error: "Unauthorized Access"});
        }

        const user = await prisma.user.findUnique({
            where: {id}
        });
        if (!user) {
            return res.status(404).json({error: "User not found"});
        }

        const following = await prisma.follow.findMany({
            where: {followerId: id},
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
            where: {followerId: id}
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
        res.status(500).json({error: error.message});
    }
}

export const bookmarkStory = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session?.user?.userId || req.user?.userId ;
        if(!userId){
            return res.status(401).json({error: "Unauthorized Access"})
        }

        const story = await prisma.story.findUnique({
            where: {id}
        });
        if(!story){
            return res.status(404).json({error: "Story not found"});
        }        

        const existingBookmark = await prisma.bookmark.findUnique({
            where: {
                userId_storyId: {
                    userId,
                    storyId: id
                }
            }
        });

        if(existingBookmark){
            return res.status(400).json({error: "Story already bookmarked"});
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
            where: {id},
            data: {
                bookmarkCount
            }
        });

        await cache.evictPattern(`user_bookmarks:${userId}:*`);
        await cache.evict("user_bookmark_status", [userId, id]);

        res.status(200).json({msg: "Story bookmarked successfully"});
    } catch(error: any){
        console.error(error);
        res.status(500).json({error: error.message});
    }
}

export const removeBookmark = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session?.user?.userId || req.user?.userId ;
        if(!userId){
            return res.status(401).json({error: "Unauthorized Access"})
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
            where: {id},
            data: {
                bookmarkCount
            }
        });

        await cache.evictPattern(`user_bookmarks:${userId}:*`);
        await cache.evict("user_bookmark_status", [userId, id]);

        res.status(200).json({msg: "Bookmark removed successfully"});
    } catch(error: any){
        console.error(error);
        res.status(500).json({error: error.message});
    }
}

export const getUserBookmarks = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session?.user?.userId || req.user?.userId ;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const cachedData = await cache.get("user_bookmarks", [userId || 'anonymous', page.toString(), limit.toString()]);
        if (cachedData) {
            return res.status(200).json(cachedData);
        }

        if (!userId) {      
            return res.status(401).json({error: "Unauthorized Access"});
        }

        const bookmarks = await prisma.bookmark.findMany({
            where: {userId},
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
            where: {userId}
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
        res.status(500).json({error: error.message});
    }
}

export const contentSearch = async (req: Request, res: Response): Promise<any> => {
    try {
        const { q } = req.query as { q?: string };
        if(!q){
            return res.status(400).json({error: "Search query is required"});
        }

        const [stories, people, publications, topics] = await Promise.all([
            prisma.story.findMany({
                where: {
                    title: {
                        contains: q,
                        mode: "insensitive"
                    }
                },
                take: 10
            }),
            prisma.user.findMany({
                where: {
                    name: {
                        contains: q,
                        mode: "insensitive"
                    }
                },
                take: 10
            }),
            prisma.publication.findMany({
                where: {
                    name: {
                        contains: q,
                        mode: "insensitive"
                    }
                },
                take: 10
            }),
            prisma.tag.findMany({
                where: {
                    name: {
                        contains: q, mode: 'insensitive'
                    }
                },
                take: 10
            })
        ]);
        return res.status(200).json({stories, people, publications, topics});
    } catch (err: any){
        console.error("Error while search", err);
        return res.status(500).json({error: "Internal Server Error"});
    }
}