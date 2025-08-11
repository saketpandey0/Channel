import { Request, response, Response, Router } from "express";
import storyValidation from "@repo/zod/storyValidation";
import { prisma } from "@repo/db";
import { generateSlug } from "../utils/generateSlug";
import { calcReadTime } from "../utils/calcReadTime";



export const createStory = async (req: Request, res: Response): Promise<any> => {
    try {
        const userId = req.session?.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { success, data } = storyValidation.safeParse(req.body);
        if (!success) {
            return res.status(400).json({ error: "Invalid story data", issues: data });
        }

        const { title, subtitle, content, excerpt, coverImage, tags, publicationId, isPremium, allowComments, allowClaps } = data;
        const slug = generateSlug(title);
        const readTime = calcReadTime(content);
        const wordCount = content.split(/\s+/).length;
        const plainTextContent = content.replace(/<[^>]+>/g, '');
        const newBlogPost = await prisma.story.create({
            data: {
                slug,
                title,
                subtitle,
                content,
                plainTextContent,
                excerpt,
                coverImage,
                readTime,
                wordCount,
                authorId: userId,
                publicationId,
                isPremium: isPremium || false,
                allowComments: allowComments || true,
                allowClaps: allowClaps || true,
                status: 'DRAFT',
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                    }
                },
                tags: {
                    include: {
                        tag: true
                    }
                }
            }
        });

        if (tags && tags.length > 0) {
            for (const tagName of tags) {
                const tag = await prisma.tag.upsert({
                    where: {
                        name: tagName
                    },
                    create: {
                        name: tagName,
                        slug: generateSlug(tagName)
                    },
                    update: {}
                })
                await prisma.storyTag.create({
                    data: {
                        storyId: newBlogPost.id,
                        tagId: tag.id
                    }
                })
            }
        }
        res.status(201).json(newBlogPost);
    } catch (error) {
        console.error("Error creating blog post:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}


export const getStory = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const userId = req.session.user?.userId;
        if (userId) {
            return res.status(404).json({ error: "User session is not found" });
        }
        const story = await prisma.story.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                        bio: true,
                        isVerified: true
                    }
                },
                publication: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        logo: true,
                        description: true
                    }
                },
                tags: {
                    include: {
                        tag: {
                            select: {
                                id: true,
                                name: true,
                                slug: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        claps: true,
                        comments: true,
                        bookmarks: true
                    }
                }
            }
        });
        if (!story) {
            return res.status(404).json({ error: "Story not found" });
        }
        if (story.status !== "PUBLISHED" && story.authorId !== userId) {
            return res.status(403).json({ error: "Access denied" });
        }
        if (userId) {
            await prisma.story.update({
                where: { id },
                data: {
                    viewCount: { increment: 1 },
                    lastViewedAt: new Date()
                },
            });

            await prisma.readingHistory.upsert({
                where: {
                    userId_storyId: {
                        userId,
                        storyId: id
                    }
                },
                create: {
                    userId,
                    storyId: id,
                    lastReadAt: new Date()
                },
                update: {
                    lastReadAt: new Date()
                }
            })
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
}


export const getStories = async (req: Request, res: Response): Promise<any> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
        const tag = req.query.tag as string;
        const authorId = req.query.authorId as string;
        const publicationId = req.query.publicationId as string;
        const search = req.query.search as string;

        const where: any = {
            status: 'PUBLISHED',
            isPublic: true,
        };
        if (tag) {
            where.tage = {
                some: {
                    tag: {
                        slug: tag
                    }
                }
            }
        }
        if (authorId) {
            where.authorId = authorId;
        }
        if (publicationId) {
            where.publicationId = publicationId;
        }
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { subtitle: { contains: search, mode: 'insensitive' } },
                { excerpt: { contains: search, mode: 'insensitive' } }
            ]
        }

        const stories = await prisma.story.findMany({
            where,
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                    }
                },
                publication: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        logo: true
                    }
                },
                tags: {
                    include: {
                        tag: {
                            select: {
                                id: true,
                                name: true,
                                slug: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        claps: true,
                        comments: true,
                        bookmarks: true
                    }
                }
            },
            orderBy: {
                publishedAt: 'desc'
            },
            skip,
            take: limit
        });

        const totalStories = await prisma.story.count({
            where
        });

        res.status(200).json({
            stories,
            pagination: {
                page,
                limit,
                total: totalStories,
                totalPages: Math.ceil(totalStories / limit),
            }
        });
    } catch (error) {
        console.error("Error fetching stories:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}


export const updateStory = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const userId = req.session.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }

        const story = await prisma.story.findUnique({
            where: { id },
            include: {
                tags: true,
                versions: true
            }
        });

        if (!story) {
            return res.status(404).json({ error: "Story not found" });
        }

        if (story.authorId !== userId) {
            return res.status(403).json({ error: "Access denied" });
        }

        const { success, data } = storyValidation.safeParse(req.body);
        if (!success) {
            return res.status(400).json({ error: "Invalid story data" });
        }

        const { title, subtitle, content, excerpt, coverImage, tags, publicationId, isPremium, allowComments, allowClaps } = data;

        const slug = title ? generateSlug(title) : story.slug;
        const readTime = content ? calcReadTime(content) : story.readTime;
        const wordCount = content ? content.split(/\s+/).length : story.wordCount;
        const plainTextContent = content ? content.replace(/<[^>]*>/g, '') : story.plainTextContent;

        await prisma.storyVersion.create({
            data: {
                storyId: id,
                version: story.versions?.length ? story.versions.length + 1 : 1,
                title: story.title,
                content: story.content,
                changes: `Updated by ${req.session.user?.name}`,
            },
        });

        const updatedStory = await prisma.story.update({
            where: { id },
            data: {
                title: title || story.title,
                subtitle: subtitle || story.subtitle,
                excerpt: excerpt || story.excerpt,
                content: content || story.content,
                coverImage: coverImage || story.coverImage,
                plainTextContent,
                slug,
                readTime,
                wordCount,
                publicationId: publicationId || story.publicationId,
                isPremium: isPremium !== undefined ? isPremium : story.isPremium,
                allowComments: allowComments !== undefined ? allowComments : story.allowComments,
                allowClaps: allowClaps !== undefined ? allowClaps : story.allowClaps
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true
                    }
                },
                tags: {
                    include: {
                        tag: true
                    }
                }
            }
        });
        if (tags) {
            await prisma.storyTag.deleteMany({
                where: {
                    storyId: id
                }
            });
            for (const tagName of tags) {
                const tag = await prisma.tag.upsert({
                    where: {
                        name: tagName
                    },
                    create: {
                        name: tagName,
                        slug: generateSlug(tagName)
                    },
                    update: {}
                });
                await prisma.storyTag.create({
                    data: {
                        storyId: id,
                        tagId: tag.id
                    }
                })
            }
        }
        res.status(200).json({ story: updatedStory });
    } catch (err) {
        console.error("Error", err);
        return res.status(500).json({ err: "Internal server error" })
    }
}


export const deleteStory = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const userId = req.session.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Authentication Required" });
        }
        const story = await prisma.story.findUnique({
            where: { id }
        });
        if (!story) {
            return res.status(404).json({ error: "Story not Found" });
        }
        if (story.authorId !== userId) {
            return res.status(403).json({ error: "Access denied" })
        }
        await prisma.story.delete({
            where: { id }
        })
        res.status(200).json({ message: "Story deleted Successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
}


export const getFeed = async (req: Request, res: Response): Promise<any> => {
    try {
        const userId = req.session?.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Accesss" });
        }
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const following = await prisma.follow.findMany({
            where: {
                followerId: userId
            },
            select: {
                followingId: true
            }
        })

        const followingIds = following.map(f => f.followingId);

        const stories = await prisma.story.findMany({
            where: {
                status: 'PUBLISHED',
                isPublic: true,
                authorId: {
                    in: followingIds
                }
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
                publication: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        logo: true
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
                        bookmarks: true
                    }
                }
            },
            orderBy: { publishedAt: 'desc' },
            skip,
            take: limit
        })
        res.status(200).json({ stories });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
}


export const getTrendingStories = async (req: Request, res: Response): Promise<any> => {
    try {
        const userId = req.session?.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Accesss" });
        }
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const stories = await prisma.story.findMany({
            where: {
                status: 'PUBLISHED',
                isPublic: true,
                publishedAt: {
                    gte: sevenDaysAgo
                }
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
                publication: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        logo: true
                    }
                },
                tags: {
                    include: {
                        tag: {
                            select: {
                                id: true,
                                name: true,
                                slug: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        claps: true,
                        comments: true,
                        bookmarks: true
                    }
                }
            },
            orderBy: [
                { clapCount: 'desc' },
                { commentCount: 'desc' },
                { bookmarkCount: 'desc' }
            ],
            skip,
            take: limit
        });
        res.status(200).json({ stories });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
}


export const publishStory = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const userId = req.session.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }

        const story = await prisma.story.findUnique({
            where: { id }
        });

        if (!story) {
            return res.status(404).json({ error: "Story not found" });
        }

        if (story.authorId !== userId) {
            return res.status(403).json({ error: "Access denied" });
        }

        if (story.status === 'PUBLISHED') {
            return res.status(400).json({ error: "Story is already published" });
        }

        const updatedStory = await prisma.story.update({
            where: { id },
            data: {
                status: 'PUBLISHED',
                publishedAt: new Date(),
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                    }
                },
                publication: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    }
                }
            }
        });

        res.status(200).json({ story: updatedStory });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};


export const unpublishStory = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const userId = req.session.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }

        const story = await prisma.story.findUnique({
            where: { id }
        });

        if (!story) {
            return res.status(404).json({ error: "Story not found" });
        }

        if (story.authorId !== userId) {
            return res.status(403).json({ error: "Access denied" });
        }

        const updatedStory = await prisma.story.update({
            where: { id },
            data: {
                status: 'DRAFT',
                publishedAt: null,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                    }
                }
            }
        });

        res.status(200).json({ story: updatedStory });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};


export const getUserDrafts = async (req: Request, res: Response): Promise<any> => {
    try {
        const userId = req.session.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }

        const drafts = await prisma.story.findMany({
            where: {
                authorId: userId,
                status: 'DRAFT',
            },
            include: {
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
                publication: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    }
                }
            },
            orderBy: { updatedAt: 'desc' },
        });

        res.status(200).json({ drafts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};


export const getUserPublishedStories = async (req: Request, res: Response): Promise<any> => {
    try {
        const userId = req.session.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }

        const stories = await prisma.story.findMany({
            where: {
                authorId: userId,
                status: 'PUBLISHED',
            },
            include: {
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
                publication: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    }
                },
                _count: {
                    select: {
                        claps: true,
                        comments: true,
                        bookmarks: true,
                    }
                }
            },
            orderBy: { publishedAt: 'desc' },
        });

        res.status(200).json({ stories });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};


export const getStoriesStats = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const userId = req.session.user?.userId;
        if(!userId){
            return res.status(401).json({error: "Unauthorized Accesss"});
        }
        const story = await prisma.story.findUnique({
            where: {id},
            include: {
                author: true,
                _count: {
                    select: {
                        claps: true,
                        comments: true,
                        bookmarks: true
                    }
                }
            }
        });
        if(!story){
            return res.status(404).json({error: "Story not found"});
        }
        if(story.status !== "PUBLISHED" && story.authorId !== userId){
            return res.status(403).json({error: "Access denied"});
        }
        const readingStats = await prisma.readingHistory.aggregate({
            where: { storyId: id },
            _avg: {progress: true},
            _count: {id: true}
        });

        const stats = {
            views: story.viewCount,
            claps: story._count.claps,
            comments: story._count.comments,
            bookmarks: story._count.bookmarks,
            reads: readingStats._count.id,
            averageProgress: readingStats._avg.progress || 0,
            readTime: story.readTime,
            wordCount: story.wordCount,
        };
        res.status(200).json({ stats });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}


export const getStoryVersions = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const userId = req.session.user?.userId;
        if(!userId){
            return res.status(401).json({error: "Unauthorized Accesss"});
        }
        const story = await prisma.story.findUnique({
            where: {id},
        })
        if(!story){
            return res.status(404).json({error: "Story not found"});
        }
        if(story.authorId !== userId){
            return res.status(401).json({error: "Unauthorized Accesss"});
        }
        const versions = await prisma.storyVersion.findMany({
            where: {storyId: id},
            orderBy: {version: 'desc'}
        })
        res.status(200).json({versions});
    }catch(err){
        console.error(err);
        res.status(500).json({error: "Internal server error"});
    }
}