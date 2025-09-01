import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import {mkdirSync} from 'fs';
import fs from 'fs/promises';
import prisma from "../db"
import { cache } from '../cache/redisCache';




const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = file.mimetype.startsWith('image/') ? 'uploads/images/' : 'uploads/videos/';
    mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 200 * 1024 * 1024 , // 200MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log("uploading file", file.mimetype);
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type') as any, false);
    }
  }
});


export const uploadImage = [
    upload.single('image'),
    async (req: Request, res: Response): Promise<any> => {
        try {
            console.log("start upload");
            const {id} = req.params;
            const userId = req.session?.user?.userId || req.user?.userId;
            if(!userId){
                return res.status(401).json({error: "Unauthorized Access"});
            }
            if(!req.file){
                return res.status(400).json({error: "No file uploaded"});
            }
            console.log("upploading")
            const media = await prisma.media.create({
                data: {
                    filename: req.file.originalname,
                    originalName: req.file.originalname,
                    mimeType: req.file.mimetype,
                    size: req.file.size,
                    path: req.file.path,
                    uploadedBy: userId,
                    type: req.file.mimetype.startsWith('image/') ? 'IMAGE' : 'VIDEO',
                }
            });

            const storyMedia = await prisma.storyMedia.create({
              data: {
                storyId: id,
                mediaId: media.id,
              },
            });
            console.log("uploaded image", media);
            const image_url = `/api/media/${media.id}`;

            res.status(201).json({
                id: media.id,
                url: image_url,
                filename: media.filename,
                size: media.size,
            });
        } catch (error) {
            console.error("Error uploading image:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
]


export const uploadVideo = [
    upload.single('video'),
    async (req: Request, res: Response): Promise<any> => {
        try {
            const {id} = req.params;
            const userId = req.session?.user?.userId || req.user?.userId;
            if(!userId){
                return res.status(401).json({error: "Unauthorized Access"});
            }
            if(!req.file){
                return res.status(400).json({error: "No file uploaded"});
            }
            const media = await prisma.media.create({
                data: {
                    filename: req.file.originalname,
                    originalName: req.file.originalname,
                    mimeType: req.file.mimetype,
                    size: req.file.size,
                    path: req.file.path,
                    uploadedBy: userId,
                    type: req.file.mimetype.startsWith('image/') ? 'IMAGE' : 'VIDEO',
                }
            });

            const storyMedia = await prisma.storyMedia.create({
              data: {
                storyId: id,
                mediaId: media.id,
              },
            });

            const video_url = `/api/media/${media.id}`;
            res.status(201).json({
                id: media.id,
                url: video_url,
                filename: media.filename,
                size: media.size,
                storyMediaId: storyMedia.id,
            });
        }catch(error: any){
            console.error("Error uploading video:", error);
            res.status(500).json({error: "Internal server error"});
        }
    }
]


export const getMedia = async (req: Request, res: Response): Promise<any> => {
    try {
        const {id} = req.params;
        const cacheKey = `media`;
        const cachedMedia = await cache.get(cacheKey, [id]);
        let media;
        if(cachedMedia){
            media = JSON.parse(cachedMedia);
        }else {
            media = await prisma.media.findUnique({
                where: {id}
            });
            if(!media){
                return res.status(404).json({error: "Media not found"});
            }
            await cache.set(cacheKey, [id], media, 86400);
        }
        const filePath = path.resolve(media.path);
        try{
            await fs.access(filePath);
        } catch(err){
            return res.status(404).json({error: "Media not found"});
        }

        res.setHeader('Content-Type', media.mimeType);
        res.setHeader('Content-Length', media.size);
        res.setHeader('Cache-Control', 'public, max-age=31536000');

        res.sendFile(media);
    } catch (error) {
        console.error("Error getting media:", error);
        res.status(500).json({error: "Internal server error"});
    }
}


export const getRelatedStories = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 5;

    const cacheKeyArgs = [id, limit.toString()];
    const cachedRelated = await cache.get("relatedStories", cacheKeyArgs);
    if (cachedRelated) {
      return res.status(200).json({ stories: cachedRelated });
    }

    if (cachedRelated) {
      return res.status(200).json({ stories: JSON.parse(cachedRelated) });
    }

    const story = await prisma.story.findUnique({
      where: { id },
      include: {
        tags: {
          include: { tag: true }
        },
        author: true,
      }
    });

    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }

    const tagIds = story.tags.map(st => st.tagId);

    const relatedStories = await prisma.story.findMany({
      where: {
        AND: [
          { id: { not: id } },
          { status: 'PUBLISHED' },
          { isPublic: true },
          {
            OR: [
              // for same tags, author, and publication
              { tags: { some: { tagId: { in: tagIds } } } },
              { authorId: story.authorId },
              story.publicationId ? { publicationId: story.publicationId } : {},
            ]
          }
        ]
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
      },
      orderBy: [
        { clapCount: 'desc' },
        { viewCount: 'desc' },
        { publishedAt: 'desc' },
      ],
      take: limit,
    });

    await cache.set("relatedStories", cacheKeyArgs, relatedStories, 3600);

    res.status(200).json({ stories: relatedStories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const reportStory = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const userId = req.session?.user?.userId || req.user?.userId;
        const {reason, description} = req.body;

        if(!userId){
            return res.status(401).json({error: "Unauthorized Access"});
        }

        if(!reason){
            return res.status(400).json({error: "Reason is required"});
        }

        const story = await prisma.story.findUnique({
            where: {id}
        });
        if(!story){
            return res.status(404).json({error: "Story not found"});
        }

        const existingReport = await prisma.report.findFirst({
            where: {
                storyId: story.id,
                reportedById: userId,
            }
        });

        if(existingReport){
            return res.status(400).json({error: "You have already reported this story"});
        }

        await prisma.report.create({
            data: {
                reportedById: userId,
                storyId: story.id,
                reason,
                description,
                status: 'PENDING',
            }
        });
        res.status(201).json({message: "Report submitted successfully"});
    } catch(error: any){    
        console.error("Error reporting story:", error);
        res.status(500).json({error: "Internal server error"});
    }
}


