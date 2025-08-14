import { prisma } from "@repo/db";
import { Request, RequestHandler, Response } from 'express';
import { getRedisClient } from '../utils/RedisClient';
import { requireAdmin } from '../middlewares/adminMiddleware';
import { stat } from "fs";


const redis = getRedisClient();


type EngagementStats = {
    active_readers: number;
    avg_reading_time: number;
    avg_progress: number;
};


export const getAdminUsers: RequestHandler[] = [
    requireAdmin,
    async (req: Request, res: Response): Promise<any> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const skip = (page - 1) * limit;
            const search = req.query.search as string;
            const status = req.query.status as string;
            const role = req.query.role as string;

            const where: any = {};

            if (search) {
                where.OR = [
                    { username: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { displayName: { contains: search, mode: 'insensitive' } },
                ];
            }

            if (status) where.status = status;
            if (role) where.role = role;

            const users = await prisma.user.findMany({
                where,
                select: {
                    id: true,
                    username: true,
                    email: true,
                    name: true,
                    role: true,
                    status: true,
                    isVerified: true,
                    createdAt: true,
                    lastActiveAt: true,
                    _count: {
                        select: {
                            stories: true,
                            followers: true,
                            following: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            });

            const totalUsers = await prisma.user.count({ where });

            res.status(200).json({
                users,
                pagination: {
                    page,
                    limit,
                    total: totalUsers,
                    totalPages: Math.ceil(totalUsers / limit),
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
];

export const updateUserStatus = [
    requireAdmin,
    async (req: Request, res: Response): Promise<any> => {
        try {
            const { id } = req.params;
            const { status, reason } = req.body;

            if (!['ACTIVE', 'SUSPENDED', 'BANNED'].includes(status)) {
                return res.status(400).json({ error: "Invalid status" });
            }

            const updatedUser = await prisma.user.update({
                where: { id },
                data: { status },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    name: true,
                    status: true,
                }
            });

            await redis.del(`user:${id}`);
            await redis.del(`analytics:dashboard:${id}`);

            res.status(200).json({ user: updatedUser });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
];

export const deleteUserAccount = [
    requireAdmin,
    async (req: Request, res: Response): Promise<any> => {
        try {
            const { id } = req.params;

            await prisma.user.delete({
                where: { id }
            });

            const keys = await redis.keys(`*:${id}:*`);
            if (keys.length > 0) {
                await redis.del(...keys);
            }

            res.status(200).json({ message: "User account deleted successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
];

export const getAdminStories = [
    requireAdmin,
    async (req: Request, res: Response): Promise<any> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const skip = (page - 1) * limit;
            const status = req.query.status as string;
            const search = req.query.search as string;

            const where: any = {};

            if (status) where.status = status;
            if (search) {
                where.OR = [
                    { title: { contains: search, mode: 'insensitive' } },
                    { subtitle: { contains: search, mode: 'insensitive' } },
                ];
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
                        }
                    },
                    _count: {
                        select: {
                            claps: true,
                            comments: true,
                            reports: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            });

            const totalStories = await prisma.story.count({ where });

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
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
];

export const moderateStory = [
    requireAdmin,
    async (req: Request, res: Response): Promise<any> => {
        try {
            const { id } = req.params;
            const { status, reason } = req.body;

            if (!['PUBLISHED', 'ARCHIVED', 'DRAFT'].includes(status)) {
                return res.status(400).json({ error: "Invalid status" });
            }

            const updatedStory = await prisma.story.update({
                where: { id },
                data: { status },
            });

            await redis.del(`story:${id}`);
            await redis.del(`related:${id}:*`);

            res.status(200).json({ story: updatedStory });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
];

export const removeStory = [
    requireAdmin,
    async (req: Request, res: Response): Promise<any> => {
        try {
            const { id } = req.params;

            await prisma.story.delete({
                where: { id }
            });

            await redis.del(`story:${id}`);
            await redis.del(`related:${id}:*`);

            res.status(200).json({ message: "Story removed successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
];

export const getAdminPublications = [
    requireAdmin,
    async (req: Request, res: Response): Promise<any> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const skip = (page - 1) * limit;

            const publications = await prisma.publication.findMany({
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
                take: limit,
            });

            const totalPublications = await prisma.publication.count();

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
];


export const moderatePublication = [
    requireAdmin,
    async (req: Request, res: Response): Promise<any> => {
        try {
            const { id } = req.params;
            const { isPublic, reason } = req.body;

            const updatedPublication = await prisma.publication.update({
                where: { id },
                data: { isPublic },
            });

            await redis.del(`publication:${id}`);

            res.status(200).json({ publication: updatedPublication });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
];

export const getAdminReports = [
    requireAdmin,
    async (req: Request, res: Response): Promise<any> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const skip = (page - 1) * limit;
            const status = req.query.status as string || 'PENDING';
            const statusOptions = ['UNDER_REVIEW', 'RESOLVED', 'DISMISSED'];
            if (statusOptions.includes(status)) {
                return res.status(400).json({ error: "Invalid status" });
            }
            if (status !== 'PENDING') {
                return res.status(400).json({ error: "Invalid status" });
            }
            const reports = await prisma.report.findMany({
                where: { status },
                include: {
                    reportedBy: {
                        select: {
                            id: true,
                            username: true,
                            name: true,
                            avatar: true,
                        }
                    },
                    story: {
                        select: {
                            id: true,
                            title: true,
                            author: {
                                select: {
                                    id: true,
                                    username: true,
                                    name: true,
                                }
                            }
                        }
                    },
                    comment: {
                        select: {
                            id: true,
                            content: true,
                            author: {
                                select: {
                                    id: true,
                                    username: true,
                                    name: true,
                                }
                            }
                        }
                    },
                    user: {
                        select: {
                            id: true,
                            username: true,
                            name: true,
                            avatar: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            });

            const totalReports = await prisma.report.count({ where: { status } });

            res.status(200).json({
                reports,
                pagination: {
                    page,
                    limit,
                    total: totalReports,
                    totalPages: Math.ceil(totalReports / limit),
                }
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
];

export const resolveReport = [
    requireAdmin,
    async (req: Request, res: Response): Promise<any> => {
        try {
            const { id } = req.params;
            const { status, action } = req.body;

            if (!['RESOLVED', 'DISMISSED'].includes(status)) {
                return res.status(400).json({ error: "Invalid status" });
            }

            const report = await prisma.report.update({
                where: { id },
                data: {
                    status,
                    resolvedAt: new Date(),
                },
                include: {
                    story: true,
                    comment: true,
                    user: true,
                }
            });

            // Take action based on report resolution
            if (status === 'RESOLVED' && action) {
                switch (action) {
                    case 'DELETE_STORY':
                        if (report.storyId) {
                            await prisma.story.delete({ where: { id: report.storyId } });
                            await redis.del(`story:${report.storyId}`);
                        }
                        break;
                    case 'DELETE_COMMENT':
                        if (report.commentId) {
                            await prisma.comment.delete({ where: { id: report.commentId } });
                        }
                        break;
                    case 'SUSPEND_USER':
                        if (report.userId) {
                            await prisma.user.update({
                                where: { id: report.userId },
                                data: { status: 'SUSPENDED' }
                            });
                            await redis.del(`user:${report.userId}`);
                        }
                        break;
                }
            }

            res.status(200).json({ report });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
];

export const getAdminAnalytics = [
    requireAdmin,
    async (req: Request, res: Response): Promise<any> => {
        try {
            const cacheKey = 'analytics:admin:platform';
            const cachedAnalytics = await redis.get(cacheKey);

            if (cachedAnalytics) {
                return res.status(200).json({ analytics: JSON.parse(cachedAnalytics) });
            }

            const [
                userStats,
                storyStats,
                publicationStats,
                engagementStats,
                monthlyGrowth,
            ] = await Promise.all([
                // User statistics
                prisma.user.groupBy({
                    by: ['status'],
                    _count: { id: true },
                }),

                // Story statistics
                prisma.story.aggregate({
                    _count: { id: true },
                    _sum: { viewCount: true, clapCount: true, commentCount: true },
                }),

                // Publication statistics
                prisma.publication.aggregate({
                    _count: { id: true },
                }),

                // Engagement statistics
                prisma.$queryRaw<EngagementStats[]>`
                    SELECT 
                        COUNT(DISTINCT rh.user_id) as active_readers,
                        AVG(rh.reading_time) as avg_reading_time,
                        AVG(rh.progress) as avg_progress
                    FROM reading_history rh
                    WHERE rh.last_read_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                `,

                // Monthly growth
                prisma.$queryRaw`
                    SELECT 
                        DATE_FORMAT(created_at, '%Y-%m') as month,
                        COUNT(*) as new_users,
                        'users' as type
                    FROM users 
                    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                    GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                    
                    UNION ALL
                    
                    SELECT 
                        DATE_FORMAT(published_at, '%Y-%m') as month,
                        COUNT(*) as new_stories,
                        'stories' as type
                    FROM stories 
                    WHERE published_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                    AND status = 'PUBLISHED'
                    GROUP BY DATE_FORMAT(published_at, '%Y-%m')
                    
                    ORDER BY month DESC
                `,
            ]);

            const analytics = {
                users: {
                    total: userStats.reduce((sum, stat) => sum + stat._count.id, 0),
                    byStatus: userStats,
                },
                stories: {
                    total: storyStats._count.id,
                    totalViews: storyStats._sum.viewCount || 0,
                    totalClaps: storyStats._sum.clapCount || 0,
                    totalComments: storyStats._sum.commentCount || 0,
                },
                publications: {
                    total: publicationStats._count.id,
                },
                engagement: engagementStats[0],
                growth: monthlyGrowth,
            };

            await redis.setex(cacheKey, 1800, JSON.stringify(analytics));

            res.status(200).json({ analytics });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
];

export const getSystemHealth = [
    requireAdmin,
    async (req: Request, res: Response): Promise<any> => {
        try {
            const cacheKey = 'system:health';
            const cachedHealth = await redis.get(cacheKey);

            if (cachedHealth) {
                return res.status(200).json({ health: JSON.parse(cachedHealth) });
            }

            const dbStart = Date.now();
            await prisma.$queryRaw`SELECT 1`;
            const dbLatency = Date.now() - dbStart;

            const redisStart = Date.now();
            await redis.ping();
            const redisLatency = Date.now() - redisStart;

            const health = {
                database: {
                    status: dbLatency < 100 ? 'healthy' : dbLatency < 500 ? 'warning' : 'critical',
                    latency: dbLatency,
                },
                redis: {
                    status: redisLatency < 50 ? 'healthy' : redisLatency < 200 ? 'warning' : 'critical',
                    latency: redisLatency,
                },
                memory: {
                    used: process.memoryUsage(),
                },
                uptime: process.uptime(),
                timestamp: new Date(),
            };

            await redis.setex(cacheKey, 60, JSON.stringify(health));

            res.status(200).json({ health });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
];
