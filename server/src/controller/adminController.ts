import prisma from "../db"
import { Request, RequestHandler, Response, NextFunction } from 'express';
import { cache, redis } from '../cache/redisCache';
import { requireAdmin } from '../middlewares/adminMiddleware';
import { body, query, param, validationResult } from 'express-validator';



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
                    { name: { contains: search, mode: 'insensitive' } },
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
                    avatar: true,
                    bio: true,
                    followersCount: true,
                    followingCount: true,
                    bookmarkCount: true,
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
            const { status } = req.body;

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

            await cache.evict(`user`, [id]);
            await cache.evict(`analytics:dashboard`, [id]);

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
        where: { id },
      });

      const deletedCount = await cache.evictPattern(`*:${id}:*`);

      res.status(200).json({
        message: "User account deleted successfully",
        cacheEvicted: deletedCount,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
];


export const getAdminStories = [
    requireAdmin,
    async (req: Request, res: Response): Promise<any> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const skip = (page - 1) * limit;
            const status = req.query.status as string || "";
            const search = req.query.search as string || "";

            const cacheKeyArgs = [page.toString(), limit.toString(), status, search];
            const cached = await cache.get("admin:stories", cacheKeyArgs);

            if (cached) {
                return res.status(200).json(cached);
            }

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
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            });

            const totalStories = await prisma.story.count({ where });

            const responsePayload = {
                stories,
                pagination: {
                    page,
                    limit,
                    total: totalStories,
                    totalPages: Math.ceil(totalStories / limit),
                }
            };

            res.status(200).json(responsePayload);
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

      if (!["PUBLISHED", "ARCHIVED", "DRAFT"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const updatedStory = await prisma.story.update({
        where: { id },
        data: { status },
      });

      await cache.evict("story", [id]);

      const deletedRelated = await cache.evictPattern(`related:${id}:*`);

      res.status(200).json({
        story: updatedStory,
        cacheEvicted: {
          story: true,
          related: deletedRelated,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
];


export const removeStory = [
    requireAdmin,
    async (req: Request, res: Response): Promise<any> => {
        try {
            const { id } = req.params;

            await prisma.story.delete({
                where: { id }
            });

            await cache.evict(`story:${id}`, [id]);
            await cache.evictPattern(`related:${id}:*`);

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

            await cache.evict(`publication:${id}`, [id]);

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
            const type = req.query.type as string; 

            const statusOptions = ['PENDING','UNDER_REVIEW', 'RESOLVED', 'DISMISSED'];
            if (!statusOptions.includes(status)) {
                return res.status(400).json({ error: "Invalid status" });
            }

            const where: any = { status };
            
            if (type === 'story') where.storyId = { not: null };
            if (type === 'comment') where.commentId = { not: null };
            if (type === 'user') where.userId = { not: null };

            const reports = await prisma.report.findMany({
                where,
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

            const totalReports = await prisma.report.count({ where });

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
            const cacheKey = ["admin", "platform"]; 
            const cachedAnalytics = await cache.get("analytics", cacheKey);

            if (cachedAnalytics) {
                return res.status(200).json({ analytics: cachedAnalytics });
            }

            const [
                userStats,
                storyStats,
                publicationStats,
                engagementStats,
                monthlyGrowth,
            ] = await Promise.all([
                prisma.user.groupBy({
                    by: ['status'],
                    _count: { id: true },
                }),

                prisma.story.aggregate({
                    _count: { id: true },
                    _sum: { viewCount: true, clapCount: true, commentCount: true },
                }),

                prisma.publication.aggregate({
                    _count: { id: true },
                }),

                prisma.$queryRaw<EngagementStats[]>`
                    SELECT 
                        COUNT(DISTINCT rh.user_id) as active_readers,
                        AVG(rh.reading_time) as avg_reading_time,
                        AVG(rh.progress) as avg_progress
                    FROM reading_history rh
                    WHERE rh.last_read_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                `,

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

            await cache.set("analytics", cacheKey, analytics, 1800);

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
            const cacheKey = ["health"];
            const cachedHealth = await cache.get("system", cacheKey);

            if (cachedHealth) {
                return res.status(200).json({ health: cachedHealth });
            }

            const dbStart = Date.now();
            await prisma.$queryRaw`SELECT 1`;
            const dbLatency = Date.now() - dbStart;

            const redisStart = Date.now();
            await redis.ping();
            const redisLatency = Date.now() - redisStart;

            const health = {
                database: {
                    status:
                        dbLatency < 100 ? "healthy" :
                        dbLatency < 500 ? "warning" :
                        "critical",
                    latency: dbLatency,
                },
                redis: {
                    status:
                        redisLatency < 50 ? "healthy" :
                        redisLatency < 200 ? "warning" :
                        "critical",
                    latency: redisLatency,
                },
                memory: {
                    used: process.memoryUsage(),
                },
                uptime: process.uptime(),
                timestamp: new Date(),
            };

            await cache.set("system", cacheKey, health, 60);

            res.status(200).json({ health });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
];

export const getAdminDashboard = [
    requireAdmin,
    async (req: Request, res: Response): Promise<any> => {
        try {
            const cacheKey = ["dashboard", "summary"];
            const cached = await cache.get("admin", cacheKey);

            if (cached) {
                return res.status(200).json(cached);
            }

            const [
                totalUsers,
                activeUsers,
                totalStories,
                publishedStories,
                totalPublications,
                pendingReports,
                newUsersThisWeek,
                newStoriesThisWeek,
            ] = await Promise.all([
                prisma.user.count(),
                prisma.user.count({ where: { status: 'ACTIVE' } }),
                prisma.story.count(),
                prisma.story.count({ where: { status: 'PUBLISHED' } }),
                prisma.publication.count(),
                prisma.report.count({ where: { status: 'PENDING' } }),
                prisma.user.count({
                    where: {
                        createdAt: {
                            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                        }
                    }
                }),
                prisma.story.count({
                    where: {
                        publishedAt: {
                            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                        },
                        status: 'PUBLISHED'
                    }
                }),
            ]);

            const dashboardData = {
                summary: {
                    totalUsers,
                    activeUsers,
                    totalStories,
                    publishedStories,
                    totalPublications,
                    pendingReports,
                    newUsersThisWeek,
                    newStoriesThisWeek,
                },
                growth: {
                    userGrowth: newUsersThisWeek,
                    storyGrowth: newStoriesThisWeek,
                }
            };

            await cache.set("admin", cacheKey, dashboardData, 300); 

            res.status(200).json(dashboardData);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
];


export const bulkActionStories = [
    requireAdmin,
    async (req: Request, res: Response): Promise<any> => {
        try {
            const { storyIds, action } = req.body;
            
            if (!Array.isArray(storyIds) || storyIds.length === 0) {
                return res.status(400).json({ error: "Story IDs are required" });
            }

            if (!['PUBLISH', 'ARCHIVE', 'DELETE'].includes(action)) {
                return res.status(400).json({ error: "Invalid action" });
            }

            let result;
            
            switch (action) {
                case 'PUBLISH':
                    result = await prisma.story.updateMany({
                        where: { id: { in: storyIds } },
                        data: { status: 'PUBLISHED', publishedAt: new Date() }
                    });
                    break;
                case 'ARCHIVE':
                    result = await prisma.story.updateMany({
                        where: { id: { in: storyIds } },
                        data: { status: 'ARCHIVED' }
                    });
                    break;
                case 'DELETE':
                    result = await prisma.story.deleteMany({
                        where: { id: { in: storyIds } }
                    });
                    break;
            }

            await Promise.all(
                storyIds.map(id => cache.evict("story", [id]))
            );

            res.status(200).json({
                message: `Bulk ${action.toLowerCase()} completed`,
                affected: result?.count || 0,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
];


export const getUserActivityLogs = [
    requireAdmin,
    async (req: Request, res: Response): Promise<any> => {
        try {
            const { userId } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const skip = (page - 1) * limit;

            const [stories, comments, claps, follows] = await Promise.all([
                prisma.story.findMany({
                    where: { authorId: userId },
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        createdAt: true,
                        publishedAt: true,
                        viewCount: true,
                        clapCount: true,
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                }),
                prisma.comment.findMany({
                    where: { authorId: userId },
                    select: {
                        id: true,
                        content: true,
                        createdAt: true,
                        story: {
                            select: { id: true, title: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                }),
                prisma.clap.findMany({
                    where: { userId },
                    include: {
                        story: {
                            select: { id: true, title: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                }),
                prisma.follow.findMany({
                    where: { followerId: userId },
                    include: {
                        following: {
                            select: { id: true, username: true, name: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                }),
            ]);

            res.status(200).json({
                activities: {
                    stories,
                    comments,
                    claps,
                    follows,
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
];



export const requireAdminWithLogging = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const user = req.session.user || req.user;
        if(!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')){
            return res.status(403).json({error: "Admin access required"});
        }
        await prisma.adminLog.create({
            data: {
                adminId: user.userId,
                action : `${req.method} ${req.path}`,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent') || 'unknown',
                metadata: {
                    query: req.query,
                    params: req.params
                }
            }
        });
        next();
    } catch (err: any){
        console.error('Admin middleware error: ', err);
        res.status(500).json({error: "Internal server error"});
    }
}



export const getAdminLogs = [
  requireAdminWithLogging,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = (page - 1) * limit;
      const adminId = req.query.adminId as string;
      const action = req.query.action as string;

      const where: any = {};
      if (adminId) where.adminId = adminId;
      if (action) where.action = { contains: action, mode: 'insensitive' };

      const logs = await prisma.adminLog.findMany({
        where,
        include: {
          admin: {
            select: {
              id: true,
              username: true,
              name: true,
              role: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });

      const totalLogs = await prisma.adminLog.count({ where });

      res.status(200).json({
        logs,
        pagination: {
          page,
          limit,
          total: totalLogs,
          totalPages: Math.ceil(totalLogs / limit),
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
];

// Advanced analytics with caching
export const getAdvancedAnalytics = [
  requireAdminWithLogging,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const timeframe = req.query.timeframe as string || '30d';
      const cacheKey = [`analytics:advanced`, timeframe];
      
      const cached = await cache.get("admin", cacheKey);
      if (cached) {
        return res.status(200).json({ analytics: cached });
      }

      let dateFilter;
      switch (timeframe) {
        case '7d':
          dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          dateFilter = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      }

      const [
        userRegistrations,
        storyPublications,
        engagementMetrics,
        topAuthors,
        topStories,
        readerRetention,
      ] = await Promise.all([
        // User registrations over time
        prisma.user.groupBy({
          by: ['createdAt'],
          where: { createdAt: { gte: dateFilter } },
          _count: { id: true },
          orderBy: { createdAt: 'asc' },
        }),

        // Story publications over time
        prisma.story.groupBy({
          by: ['publishedAt'],
          where: { 
            publishedAt: { gte: dateFilter },
            status: 'PUBLISHED'
          },
          _count: { id: true },
          orderBy: { publishedAt: 'asc' },
        }),

        // Engagement metrics
        prisma.story.aggregate({
          where: { 
            publishedAt: { gte: dateFilter },
            status: 'PUBLISHED'
          },
          _avg: { viewCount: true, clapCount: true, commentCount: true },
          _sum: { viewCount: true, clapCount: true, commentCount: true },
        }),

        // Top authors by engagement
        prisma.user.findMany({
          where: {
            stories: {
              some: {
                publishedAt: { gte: dateFilter },
                status: 'PUBLISHED'
              }
            }
          },
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            _count: {
              select: { stories: true }
            },
            stories: {
              where: {
                publishedAt: { gte: dateFilter },
                status: 'PUBLISHED'
              },
              select: {
                viewCount: true,
                clapCount: true,
                commentCount: true,
              }
            }
          },
          take: 10,
        }),

        // Top stories by engagement
        prisma.story.findMany({
          where: {
            publishedAt: { gte: dateFilter },
            status: 'PUBLISHED'
          },
          select: {
            id: true,
            title: true,
            slug: true,
            viewCount: true,
            clapCount: true,
            commentCount: true,
            author: {
              select: {
                id: true,
                username: true,
                name: true,
                avatar: true,
              }
            }
          },
          orderBy: [
            { viewCount: 'desc' },
            { clapCount: 'desc' }
          ],
          take: 10,
        }),

        // Reader retention metrics
        prisma.readingHistory.groupBy({
          by: ['userId'],
          where: {
            lastReadAt: { gte: dateFilter }
          },
          _count: { storyId: true },
          _avg: { progress: true, readingTime: true },
          having: {
            storyId: { _count: { gt: 1 } }
          }
        }),
      ]);

      // Process top authors to calculate total engagement
      const processedAuthors = topAuthors.map(author => ({
        ...author,
        totalViews: author.stories.reduce((sum, story) => sum + (story.viewCount || 0), 0),
        totalClaps: author.stories.reduce((sum, story) => sum + (story.clapCount || 0), 0),
        totalComments: author.stories.reduce((sum, story) => sum + (story.commentCount || 0), 0),
        stories: undefined // Remove stories array from response
      }));

      const analytics = {
        timeframe,
        userGrowth: userRegistrations,
        contentGrowth: storyPublications,
        engagement: {
          average: engagementMetrics._avg,
          total: engagementMetrics._sum,
        },
        topAuthors: processedAuthors,
        topStories,
        retention: {
          returningReaders: readerRetention.length,
          avgStoriesPerReader: readerRetention.reduce((sum, reader) => sum + reader._count.storyId, 0) / readerRetention.length || 0,
          avgReadingProgress: readerRetention.reduce((sum, reader) => sum + (reader._avg.progress || 0), 0) / readerRetention.length || 0,
        }
      };

      // Cache for 1 hour
      await cache.set("admin", cacheKey, analytics, 3600);

      res.status(200).json({ analytics });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
];

// Content moderation queue
export const getModerationQueue = [
  requireAdminWithLogging,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;
      const priority = req.query.priority as string; // high, medium, low

      // Get stories that need moderation (based on reports, flags, etc.)
      const moderationItems = await prisma.story.findMany({
        where: {
          OR: [
            { status: 'DRAFT' }, // New submissions
            { 
              reports: {
                some: {
                  status: 'PENDING'
                }
              }
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
              role: true,
            }
          },
          _count: {
            select: {
              reports: true,
              claps: true,
              comments: true,
            }
          },
          reports: {
            where: { status: 'PENDING' },
            include: {
              reportedBy: {
                select: {
                  id: true,
                  username: true,
                  name: true,
                }
              }
            },
            take: 5, // Limit recent reports
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: [
          { reports: { _count: 'desc' } }, // Prioritize by report count
          { createdAt: 'desc' }
        ],
        skip,
        take: limit,
      });

      const totalItems = await prisma.story.count({
        where: {
          OR: [
            { status: 'DRAFT' },
            { 
              reports: {
                some: {
                  status: 'PENDING'
                }
              }
            }
          ]
        }
      });

      // Calculate priority scores
      const itemsWithPriority = moderationItems.map(item => {
        const reportCount = item._count.reports;
        const authorRole = item.author.role;
        
        let priorityScore = 0;
        if (reportCount > 5) priorityScore += 3;
        else if (reportCount > 2) priorityScore += 2;
        else if (reportCount > 0) priorityScore += 1;
        
        if (authorRole === 'READER') priorityScore += 1; // New users get extra scrutiny
        
        const priority = priorityScore >= 3 ? 'high' : priorityScore >= 1 ? 'medium' : 'low';
        
        return {
          ...item,
          priority,
          priorityScore
        };
      });

      res.status(200).json({
        items: itemsWithPriority,
        pagination: {
          page,
          limit,
          total: totalItems,
          totalPages: Math.ceil(totalItems / limit),
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
];

// Batch content actions
// export const batchContentAction = [
//   requireAdminWithLogging,
//   body('itemIds').isArray({ min: 1 }).withMessage('At least one item ID required'),
//   body('action').isIn(['approve', 'reject', 'archive', 'delete', 'flag']).withMessage('Invalid action'),
//   body('reason').optional().isLength({ min: 10, max: 500 }).withMessage('Reason must be 10-500 characters'),
//   async (req: Request, res: Response): Promise<any> => {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//       }

//       const { itemIds, action, reason } = req.body;
//       const adminId = req.user?.userId;

//       let results = [];

//       for (const itemId of itemIds) {
//         try {
//           let result;
          
//           switch (action) {
//             case 'approve':
//               result = await prisma.story.update({
//                 where: { id: itemId },
//                 data: { 
//                   status: 'PUBLISHED',
//                   publishedAt: new Date()
//                 }
//               });
//               break;
              
//             case 'reject':
//             case 'archive':
//               result = await prisma.story.update({
//                 where: { id: itemId },
//                 data: { status: 'ARCHIVED' }
//               });
//               break;
              
//             case 'delete':
//               result = await prisma.story.delete({
//                 where: { id: itemId }
//               });
//               break;
              
//             case 'flag':
//               // Create internal flag for further review
//               await prisma.contentFlag.create({
//                 data: {
//                   storyId: itemId,
//                   flaggedBy: adminId,
//                   reason: reason || 'Flagged for review',
//                   type: 'ADMIN_FLAG'
//                 }
//               });
//               result = { id: itemId, flagged: true };
//               break;
//           }

//           // Log the action
//           await prisma.adminLog.create({
//             data: {
//               adminId: adminId!,
//               action: `BATCH_${action.toUpperCase()}`,
//               targetId: itemId,
//               targetType: 'STORY',
//               metadata: { reason }
//             }
//           });

//           await cache.evict('story', [itemId]);
          
//           results.push({ id: itemId, success: true, result });
//         } catch (error: any) {
//           results.push({ id: itemId, success: false, error: error.message });
//         }
//       }

//       res.status(200).json({
//         message: `Batch ${action} completed`,
//         results,
//         successful: results.filter(r => r.success).length,
//         failed: results.filter(r => !r.success).length
//       });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "Internal server error" });
//     }
//   }
// ];

// Export user data (GDPR compliance)
export const exportUserData = [
  requireAdminWithLogging,
  param('userId').isUUID().withMessage('Valid user ID required'),
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { userId } = req.params;

      const userData = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          stories: {
            include: {
              tags: {
                include: { tag: true }
              },
              comments: true,
              claps: true,
            }
          },
          comments: {
            include: {
              story: {
                select: { id: true, title: true }
              }
            }
          },
          claps: {
            include: {
              story: {
                select: { id: true, title: true }
              }
            }
          },
          bookmarks: {
            include: {
              story: {
                select: { id: true, title: true, author: { select: { username: true } } }
              }
            }
          },
          followers: {
            include: {
              follower: {
                select: { id: true, username: true, name: true }
              }
            }
          },
          following: {
            include: {
              following: {
                select: { id: true, username: true, name: true }
              }
            }
          },
          readingHistory: {
            include: {
              story: {
                select: { id: true, title: true }
              }
            }
          },
          reports: true,
          notifications: true,
        }
      });

      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Remove sensitive data
      const exportData = {
        ...userData,
        password: undefined, // Never export passwords
        refreshTokens: undefined,
      };

      res.status(200).json({
        user: exportData,
        exportedAt: new Date(),
        dataTypes: [
          'profile', 'stories', 'comments', 'claps', 'bookmarks',
          'followers', 'following', 'reading_history', 'reports', 'notifications'
        ]
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
];

// Site-wide notifications
export const createSiteNotification = [
  requireAdminWithLogging,
  body('title').isLength({ min: 1, max: 100 }).withMessage('Title is required (max 100 chars)'),
  body('message').isLength({ min: 1, max: 500 }).withMessage('Message is required (max 500 chars)'),
  body('type').isIn(['INFO', 'WARNING', 'ERROR', 'SUCCESS']).withMessage('Invalid notification type'),
  body('targetUsers').optional().isArray().withMessage('Target users must be an array'),
  async (req: Request, res: Response): Promise<any> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, message, type, targetUsers, expiresAt } = req.body;

      // If no specific users targeted, send to all active users
      const userIds = targetUsers || await prisma.user.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true }
      }).then(users => users.map(u => u.id));

      // Create notifications in batches
      const batchSize = 1000;
      let createdCount = 0;

      for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize);
        
        const notifications = batch.map((userId: any) => ({
          userId,
          type: type as 'STORY_PUBLISHED' | 'COMMENT_RECEIVED' | 'CLAP_RECEIVED' | 'FOLLOWER_GAINED' | 'STORY_ACCEPTED' | 'STORY_REJECTED' | 'NEWSLETTER_SENT' | 'MENTION_RECEIVED',
          title,
          message,
          data: {
            isAdminNotification: true,
            expiresAt: expiresAt || null
          }
        }));

        await prisma.notification.createMany({
          data: notifications
        });

        createdCount += batch.length;
      }

      res.status(200).json({
        message: 'Site notification created successfully',
        recipientCount: createdCount,
        type,
        title,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
];

// export const getPlatformStats = [
//   requireAdminWithLogging,
//   async (req: Request, res: Response): Promise<any> => {
//     try {
//       const cacheKey = ['platform:stats'];
//       const cached = await cache.get('admin', cacheKey);
      
//       if (cached) {
//         return res.status(200).json({ stats: cached });
//       }

//       const [
//         totalUsers,
//         activeUsers,
//         bannedUsers,
//         totalStories,
//         publishedStories,
//         totalPublications,
//         totalReports,
//         pendingReports,
//         avgStoriesPerUser,
//         avgReadingTime,
//         topTags,
//       ] = await Promise.all([
//         prisma.user.count(),
//         prisma.user.count({ where: { status: 'ACTIVE' } }),
//         prisma.user.count({ where: { status: 'BANNED' } }),
//         prisma.story.count(),
//         prisma.story.count({ where: { status: 'PUBLISHED' } }),
//         prisma.publication.count(),
//         prisma.report.count(),
//         prisma.report.count({ where: { status: 'PENDING' } }),
        
//         prisma.user.aggregate({
//           _avg: {
//             // This would need a custom query or computed field
//             stories: { _count: true }
//           }
//         }),
        
//         prisma.readingHistory.aggregate({
//           _avg: { readingTime: true }
//         }),
        
//         prisma.tag.findMany({
//           select: {
//             id: true,
//             name: true,
//             storyCount: true,
//             followerCount: true,
//           },
//           orderBy: { storyCount: 'desc' },
//           take: 10,
//         }),
//       ]);

//       const stats = {
//         users: {
//           total: totalUsers,
//           active: activeUsers,
//           banned: bannedUsers,
//           activeRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
//         },
//         content: {
//           totalStories,
//           publishedStories,
//           publications: totalPublications,
//           publishRate: totalStories > 0 ? (publishedStories / totalStories) * 100 : 0,
//         },
//         moderation: {
//           totalReports,
//           pendingReports,
//           resolvedReports: totalReports - pendingReports,
//           resolutionRate: totalReports > 0 ? ((totalReports - pendingReports) / totalReports) * 100 : 0,
//         },
//         engagement: {
//           avgReadingTime: avgReadingTime._avg.readingTime || 0,
//           topTags,
//         },
//         health: {
//           userGrowthRate: 0, // Would need time-based calculation
//           contentGrowthRate: 0, // Would need time-based calculation
//           systemLoad: 'normal', // Would come from system monitoring
//         }
//       };

//       // Cache for 5 minutes
//       await cache.set('admin', cacheKey, stats, 300);

//       res.status(200).json({ stats });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "Internal server error" });
//     }
//   }
// ];



export const validateUserUpdate = [
  param('id').isUUID().withMessage('Valid user ID required'),
  body('status').isIn(['ACTIVE', 'SUSPENDED', 'BANNED']).withMessage('Invalid status'),
  body('reason').optional().isLength({ min: 10, max: 500 }).withMessage('Reason must be 10-500 characters'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];


export const validateStoryModeration = [
    param('id').isUUID().withMessage('Valid story ID required'),
    body('status').isIn(['PUBLISHED', 'ARCHIVED', 'DRAFT']).withMessage('Invalid status'),
    body('reason').optional().isLength({min:10, max:500}).withMessage('Reason must be 10-500 characters'),
    (req: Request, res: Response, next: NextFunction) => {
        const error = validationResult(req);
        if(!error.isEmpty()){
            return res.status(400).json({ errors: error.array() });
        }
        next();
    }
]