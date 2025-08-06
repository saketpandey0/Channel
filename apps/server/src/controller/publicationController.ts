import { Request, response, Response, Router } from "express";
import publicationValidation from "@repo/zod/publicationValidation";
import { prisma } from "@repo/db";
import { generateSlug } from "../utils/generateSlug";



export const createPublication = async (req: Request, res: Response): Promise<any> => {
    try {
        const userId = req.session?.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { success, data} = publicationValidation.safeParse(req.body);
        if (!success) {
            return res.status(400).json({ error: "Invalid publication data" });
        }
        const slug = generateSlug(data.name);

        const publication = await prisma.publication.create({
            data: {
                ...data,
                slug,
                ownerId: userId
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true
                    }
                }
            }
        });
        res.status(201).json({publication});
    }catch(error: any){
        console.error(error);
        res.status(500).json({error: error.message});
    }
}


export const getPublications = async (req: Request, res: Response): Promise<any> => {
    try {
        const userId = req.session?.user?.userId;
        if(!userId){
            return res.status(401).json({error: "Unauthorized Accesss"});
        }
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search as string;

        const where: any = {
            isPublic: true,
        };

        if(search){
            where.OR = [
                { name: {contains: search, mode: 'insensitive'} },
                { description: {contains: search, mode: 'insensitive'} },
            ]
        }

        const publications = await prisma.publication.findMany({
            where,
            include: {
                owner: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                    }
                },
                _count: {
                    select: {
                        stories: true,
                        subscribers: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        });

        const totalPublications = await prisma.publication.count({where});

        res.status(200).json({
            publications,
            pagination: {
                page,
                limit,
                total: totalPublications,
                totalPages: Math.ceil(totalPublications / limit),
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}


export const getPublication  = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session?.user?.userId;
        if(!userId){
            return res.status(401).json({error: "Unauthorized Accesss"});
        }
        const publication = await prisma.publication.findUnique({
            where: {id},
            include: {
                owner: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                        bio: true,
                    }
                },
                editors: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                name: true,
                                avatar: true,
                            }
                        }
                    }
                },
                writers: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                name: true,
                                avatar: true,
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        stories: true,
                        subscribers: true,
                    }
                }
            }
        });
        if(!publication){
            return res.status(404).json({error: "Publication not found"});
        }
        res.status(200).json({publication});
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}


export const deletePublication = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session?.user?.userId;
        if(!userId){
            return res.status(401).json({error: "Unauthorized Accesss"});
        }
        const publication = await prisma.publication.findUnique({
            where: {id}
        });
        if(!publication){
            return res.status(404).json({error: "Publication not found"});
        }
        if(publication.ownerId !== userId){
            return res.status(401).json({error: "Unauthorized Accesss"});
        }
        await prisma.publication.delete({
            where: {id}
        });
        res.status(200).json({message: "Publication deleted successfully"});
    }catch(error: any){
        console.error(error);
        res.status(500).json({error: error.message});
    }
}


export const updatePublication = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session?.user?.userId;
        if(!userId){
            return res.status(401).json({error: "Unauthorized Accesss"});
        }
        const publication = await prisma.publication.findUnique({
            where: {id},
            include: {
                editors: {
                    where: {userId}
                }
            }
        })
        if(!publication){
            return res.status(404).json({error: "Publication not found"});
        }
        const isOwner = publication.ownerId === userId;
        const isEditor = publication.editors.length > 0;
        if(!isOwner && !isEditor){
            return res.status(401).json({error: "Unauthorized Accesss"});
        }

        const {success, data} = publicationValidation.safeParse(req.body);
        if (!success) {
            return res.status(400).json({ error: "Invalid publication data" });
        }
        const updatedPublication = await prisma.publication.update({
            where: {
                id,
                OR: [
                    {ownerId: userId},
                    {editors: {some: {userId}}},
                ]
            },
            data: {
                ...data,
                slug: data.name ? generateSlug(data.name) : publication.slug,
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        username: true,
                        name: true, 
                        avatar: true,
                    }
                }
            }
        });
        res.status(200).json({publication: updatedPublication});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}


export const getPublicationStories = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session?.user?.userId;
        if(!userId){
            return res.status(401).json({error: "Unauthorized Accesss"});
        }
        const publication = await prisma.publication.findUnique({
            where: {id},
        })
        if(!publication){
            return res.status(404).json({error: "Publication not found"});
        }
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
        const stories = await prisma.story.findMany({
            where: {
                publicationId: id,
                status: "PUBLISHED",
                isPublic: true,
            },
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
                        bookmarks: true,
                        comments: true,
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            },
            skip,
            take: limit
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}


export const submitStoryToPublication = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session?.user?.userId;
        const { storyId, message } = req.body;
        if(!userId){
            return res.status(401).json({error: "Unauthorized Accesss"});
        }
        if(!storyId){
            return res.status(400).json({error: "Story id is required"});
        }
        const publication = await prisma.publication.findUnique({
            where: {id},
        })
        if(!publication){
            return res.status(404).json({error: "Publication not found"});
        }

        if(!publication.allowSubmissions){
            return res.status(401).json({error: "Publication does not allow submissions"});
        }

        const story = await prisma.story.findUnique({
            where: {id: storyId},
        })
        if(!story){
            return res.status(404).json({error: "Story not found"});
        }
        if(story.authorId !== userId){
            return res.status(401).json({error: "Unauthorized Accesss"});
        }    
        const existingSubmission = await prisma.storySubmission.findUnique({
            where: {
                storyId_publicationId: {
                storyId,
                publicationId: id,
                }
            }   
        });
        if(existingSubmission){
            return res.status(400).json({error: "Story already submitted"});
        }
        const submission = await prisma.storySubmission.create({
            data: {
                storyId,
                publicationId: id,
                submittedById: userId,
                message,
                status: "PENDING",
            },
            include: {
                story: {
                    select: {
                        id: true,
                        title: true,
                        subtitle: true,
                    }
                },
                publication: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        });
        res.status(200).json({submission});
    } catch(error: any){
        console.error(error);
        res.status(500).json({error: error.message});
    }
}


export const updateSubmissionStatus = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id, storyId} = req.params;
        const userId = req.session?.user?.userId;
        if(!userId){
            return res.status(401).json({error: "Unauthorized Accesss"});
        }
        const {status, response} = req.body;

        const statusArr = ["APPROVED", "REJECTED", "NEEDS_REVISION"];
        if(!statusArr.includes(status)){
            return res.status(400).json({error: "Invalid status"});
        }

        const publication = await prisma.publication.findUnique({
            where: {id},
            include: {
                editors: {
                    where: {userId}
                }
            }
        })
        if(!publication){
            return res.status(404).json({error: "Publication not found"});
        }
        const isOwner = publication.ownerId === userId;
        const isEditor = publication.editors.length > 0;
        if(!isOwner && !isEditor){    
            return res.status(401).json({error: "Unauthorized Accesss"});
        }
        
        const submission = await prisma.storySubmission.findUnique({
            where: {
                storyId_publicationId: {
                    storyId,
                    publicationId: id,
                }
            }
        });
        if(!submission){
            return res.status(404).json({error: "Submission not found"});
        }
        const updatedSubmission = await prisma.storySubmission.update({
            where: {
                storyId_publicationId: {
                    storyId,
                    publicationId: id,
                }
            },
            data: {
                status,
                response,
                reviewedAt: new Date(),
            }
        });
        if(status === "APPROVED"){
            await prisma.story.update({
                where: {id: storyId},
                data: {
                    publicationId: id,
                    submissionStatus: "APPROVED",
                }
            });
        }
        res.status(200).json({submission: updatedSubmission});
    } catch(error: any){
        console.error(error);
        res.status(500).json({error: error.message});
    }
}


export const getPublicationWriters = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session?.user?.userId;
        if(!userId){
            return res.status(401).json({error: "Unauthorized Accesss"});
        }

        const publication = await prisma.publication.findUnique({
            where: {id},
        })

        if(!publication) {
            return res.status(404).json({error: "Publication not found"});
        }

        const writers = await prisma.publicationWriter.findMany({
            where: {
                publicationId: id
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                        bio: true,
                        isVerified: true,
                    }
                }
            },
            orderBy: {
                addedAt: "desc"
            }
        });
        res.status(200).json({writers});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}


export const addPublicationWriter = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params
        const userId = req.session?.user?.userId;
        if(!userId){
            return res.status(401).json({error: "Unauthorized Accesss"});
        }

        const {writerId} = req.body;
        if(!writerId){
            return res.status(400).json({error: "Writer id is required"});
        }

        const existingWriter = await prisma.publicationWriter.findUnique({
            where: {
                publicationId_userId: {
                    publicationId: id,
                    userId: writerId
                }
            }
        });
        if(existingWriter){
            return res.status(400).json({error: "Writer already added"});
        }

        const publicationWriter = await prisma.publicationWriter.create({
            data: {
                publicationId: id,
                userId: writerId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                    }
                }
            }
        });
        res.status(200).json({publicationWriter});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}


export const removePublicationWriter = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id, userId: writerId} = req.params;
        const userId = req.session?.user?.userId;
        if(!userId){
            return res.status(401).json({error: "Unauthorized Accesss"});
        }

        const publication = await prisma.publication.findUnique({
            where: {id},
            include: {
                editors: {
                    where: {userId}
                }
            }
        });
        if(!publication){
            return res.status(404).json({error: "Publication not found"});
        }
        const isOwner = publication.ownerId === userId;
        const isEditor = publication.editors.length > 0;
        if(!isOwner && !isEditor){
            return res.status(401).json({error: "Unauthorized Accesss"});
        }

        const deletedWriter = await prisma.publicationWriter.delete({
            where: {
                publicationId_userId: {
                    publicationId: id,
                    userId: writerId
                }
            }
        });
        res.status(200).json({message: "Writer removed successfully"});
    }catch(error: any){
        console.error(error);
        res.status(500).json({error: error.message});
    }
}


export const getPublicationEditors = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session?.user?.userId;
        if(!userId){
            return res.status(401).json({error: "Unauthorized Accesss"});
        }

        const publication = await prisma.publication.findUnique({
            where: {id},
        });

        if(!publication){
            return res.status(404).json({error: "Publication not found"});
        }

        const editors = await prisma.publicationEditor.findMany({
            where: {
                publicationId: id
            },
            include: {
                user:{
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                        bio: true,
                        isVerified: true,
                    }
                }
            },
            orderBy: {
                addedAt: "desc"
            }
        });
        res.status(200).json({editors});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}


export const addPublicationEditor = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session?.user?.userId;
        if(!userId){
            return res.status(401).json({error: "Unauthorized Accesss"});
        }

        const {editorId, role = "EDITOR"} = req.body;
        if(!editorId){
            return res.status(400).json({error: "Editor id is required"});
        }

        const publication = await prisma.publication.findUnique({
            where: {id},
        });

        if(!publication){
            return res.status(404).json({error: "Publication not found"});
        }

        //editor can be added by user only
        if(publication.ownerId !== userId){
            return res.status(401).json({error: "only Owner have Accesss"});
        }

        const editor = await prisma.user.findUnique({
            where: {
                id: editorId
            }
        });

        if(!editor){
            return res.status(404).json({error: "Editor not found"});
        }

        const existingEditor = await prisma.publicationEditor.findUnique({
            where: {
                publicationId_userId: {
                    publicationId: id,
                    userId: editorId
                }
            }
        });

        if(existingEditor){
            return res.status(400).json({error: "Editor already added"});
        }

        const publicationEditor = await prisma.publicationEditor.create({
            data: {
                publicationId: id,
                userId: editorId,
                role,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                    }
                }
            }
        });
        res.status(200).json({publicationEditor});
    } catch(error: any){
        console.error(error);
        res.status(500).json({error: error.message});
    }
}


export const removePublicationEditor = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id, userId: editorId} = req.params;
        const userId = req.session?.user?.userId;
        if(!userId){
            return res.status(401).json({error: "Unauthorized Accesss"});
        }
        const publication = await prisma.publication.findUnique({
            where: {id}
        });
        if(!publication){
            return res.status(404).json({error: "Publication not found"});
        }

        if(publication.ownerId !== userId){
            return res.status(401).json({error: "only Owner have Accesss"});
        }

        await prisma.publicationEditor.delete({
            where: {
                publicationId_userId: {
                    publicationId: id,
                    userId: editorId
                }
            }
        });
        res.status(200).json({message: "Editor removed successfully"});
    } catch(error: any){
        console.error(error);   
        res.status(500).json({error: error.message});
    }
}


export const getPublicationStats = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session?.user?.userId;
        if(!userId){
            return res.status(401).json({error: "Unauthorized Accesss"});
        }

        const publication = await prisma.publication.findUnique({
            where: {id},
            include: {
                editors: {
                    where: {
                        userId
                    }
                }
            }
        });

        if(!publication){
            return res.status(404).json({error: "Publication not found"});
        }

        const isOwner = publication.ownerId === userId;
        const isEditor = publication.editors.length > 0;
        if(!isOwner && !isEditor){
            return res.status(401).json({error: "Unauthorized Accesss"});
        }

        const storyStats = await prisma.story.aggregate({
            where: {
                publicationId: id,
                status: "PUBLISHED",
            },
            _sum: {
                viewCount: true,
                clapCount: true,
                bookmarkCount: true,
                commentCount: true,
            },
            _count: {
                id: true,
            }
        });

        const subscriberCount = await prisma.newsletterSubscription.count({
            where: {
                publicationId: id,
                isActive: true,
            }
        });

        const stats = {
            totalStories: storyStats._count.id,
            totalViews: storyStats._sum.viewCount || 0,
            totalClaps: storyStats._sum.clapCount || 0,
            totalBookmarks: storyStats._sum.bookmarkCount || 0,
            totalComments: storyStats._sum.commentCount || 0,
            subscribers: subscriberCount,
        };
        res.status(200).json({stats});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}