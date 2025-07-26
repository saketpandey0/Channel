import { Request, Response, Router } from "express";
import storyValidation from "@repo/zod/storyValidation";
import { prisma } from "@repo/db";
import { generateSlug } from "../utils/generateSlug";
import { calcReadTime } from "../utils/calcReadTime";

const router = Router();

export const createStory = async (req: Request, res: Response): Promise<any> => {

    try {
        const userId = req.session?.user?.userId;
        if(!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const {success, data} = storyValidation.safeParse(req.body);
        if(!success) {
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

        if(tags && tags.length > 0){
            for(const tagName of tags) {
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


export const getStories = async (req: Request, res: Response): Promise<any> => {
    try{ 
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
        if(tag){
            where.tage = {
                some : {
                    tag: {
                        slug: tag
                    }
                }
            }
        }
        if(authorId){
            where.authorId = authorId;
        }
        if(publicationId){
            where.publicationId = publicationId;
        }
        if(search){
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