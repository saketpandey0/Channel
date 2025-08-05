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