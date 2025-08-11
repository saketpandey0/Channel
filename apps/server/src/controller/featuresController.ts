import { Request, response, Response, Router } from "express";
import { prisma } from "@repo/db";
import commentValidation from "@repo/zod/commentValidation";
import { authenticate } from "passport";




export const clapStory = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session?.user?.userId;
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
            return res.status(400).json({error: "Story already clapped"});
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
        res.status(200).json({msg: "Story clapped successfully"});
    } catch(error: any){
        console.error(error);
        res.status(500).json({error: error.message});
    }
}


export const removeClap =  async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session?.user?.userId;
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
    } catch(error: any){
        console.error(error);
        res.status(500).json({error: error.message});
    }
}


export const getStoryClaps = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session?.user?.userId;
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
        res.status(200).json({
            totalClaps: totalClaps._sum.count || 0,
            totalClapers: totalClaps._count.id || 0,
            userClaps: userClaps?.count || 0,
            recentClaps
        });
    } catch(error: any){
        console.error(error);
        res.status(500).json({error: error.message});
    }
}


export const addComment = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session?.user?.userId;
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
                where: {id},
                data: {
                    replyCount
                }
            });
        };
        res.status(200).json({msg: "Comment updated successfully"});
    } catch(error: any){
        console.error(error);
        res.status(500).json({error: error.message});
    }
}


export const getComments = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session?.user?.userId;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
        
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
        res.status(200).json({
            comments,
            pagination: {
                page,
                limit,
                total: totalComments,
                totalPages: Math.ceil(totalComments / limit),
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}


export const updateComment = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session?.user?.userId;
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
        res.status(200).json({comment: updatedComment});
    } catch(error: any){
        console.error(error);
        res.status(500).json({error: error.message});
    }
}


export const deleteComment = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session?.user?.userId;

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
        res.status(200).json({message: "Comment deleted successfully"});
    } catch(error: any){
        console.error(error);
        res.status(500).json({error: error.message});
    }
}


export const replycomment = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session?.user?.userId;
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
        res.status(200).json({comment: reply});
    } catch(error: any){
        console.error(error);
        res.status(500).json({error: error.message});
    }
}


export const followUser = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session?.user?.userId;
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
            return res.status(400).json({error: "User already followed"});
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
        res.status(200).json({msg: "Followed successfully"});
    } catch(error: any){
        console.error(error);
        res.status(500).json({error: error.message});
    }
}


export const unfollowUser = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session?.user?.userId;
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
        res.status(200).json({msg: "Unfollowed successfully"});
    } catch(error: any){
        console.error(error);
        res.status(500).json({error: error.message});   
    }
}


export const getUserFollowers = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session?.user?.userId;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

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
        res.status(200).json({
            followers,
            pagination: {
                page,
                limit,
                total: totalFollowers,
                totalPages: Math.ceil(totalFollowers / limit),
            }
        });
    } catch(error: any){
        console.error(error);
        res.status(500).json({error: error.message});
    }
}


export const getUserFollowing = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session?.user?.userId;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

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
        res.status(200).json({
            following,
            pagination: {
                page,
                limit,
                total: totalFollowing,
                totalPages: Math.ceil(totalFollowing / limit),
            }
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({error: error.message});
    }
}


export const bookmarkStory = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session?.user?.userId;
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
        res.status(200).json({msg: "Story bookmarked successfully"});
    } catch(error: any){
        console.error(error);
        res.status(500).json({error: error.message});
    }
}


export const removeBookmark = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session?.user?.userId;
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
    } catch(error: any){
        console.error(error);
        res.status(500).json({error: error.message});
    }
}


export const getUserBookmarks = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session?.user?.userId;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

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
        res.status(200).json({
            bookmarks,
            pagination: {
                page,
                limit,
                total: bookmarks.length,
                totalPages: Math.ceil(bookmarks.length / limit),
            }
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({error: error.message});
    }
}