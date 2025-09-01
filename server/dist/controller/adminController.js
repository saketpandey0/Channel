"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePublicationUpdate = exports.validateStoryModeration = exports.validateUserUpdate = exports.createSiteNotification = exports.exportUserData = exports.getModerationQueue = exports.getAdvancedAnalytics = exports.getAdminLogs = exports.requireAdminWithLogging = exports.getUserActivityLogs = exports.bulkActionStories = exports.getAdminDashboard = exports.getSystemHealth = exports.getAdminAnalytics = exports.resolveReport = exports.getAdminReports = exports.moderatePublication = exports.getAdminPublications = exports.removeStory = exports.moderateStory = exports.getAdminStories = exports.deleteUserAccount = exports.updateUserStatus = exports.getAdminUsers = exports.getCurrentAdmin = void 0;
const db_1 = __importDefault(require("../db"));
const redisCache_1 = require("../cache/redisCache");
const adminMiddleware_1 = require("../middlewares/adminMiddleware");
const express_validator_1 = require("express-validator");
exports.getCurrentAdmin = [
    adminMiddleware_1.requireAdmin,
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const adminId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || ((_b = req.session.user) === null || _b === void 0 ? void 0 : _b.userId);
            if (!adminId) {
                return res.status(401).json({ error: "Unauthorized" });
            }
            const admin = yield db_1.default.user.findUnique({
                where: { id: adminId },
                select: {
                    id: true,
                    name: true,
                    username: true,
                    email: true,
                    role: true,
                    avatar: true,
                    isVerified: true,
                }
            });
            if (!admin) {
                return res.status(404).json({ error: "Admin not found" });
            }
            res.status(200).json(admin);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    })
];
exports.getAdminUsers = [
    adminMiddleware_1.requireAdmin,
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;
            const search = req.query.search;
            const status = req.query.status;
            const role = req.query.role;
            const where = {};
            if (search) {
                where.OR = [
                    { username: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { name: { contains: search, mode: 'insensitive' } },
                ];
            }
            if (status)
                where.status = status;
            if (role)
                where.role = role;
            const users = yield db_1.default.user.findMany({
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
            const totalUsers = yield db_1.default.user.count({ where });
            res.status(200).json({
                users,
                pagination: {
                    page,
                    limit,
                    total: totalUsers,
                    totalPages: Math.ceil(totalUsers / limit),
                }
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    })
];
exports.updateUserStatus = [
    adminMiddleware_1.requireAdmin,
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const { status } = req.body;
            if (!['ACTIVE', 'SUSPENDED', 'BANNED'].includes(status)) {
                return res.status(400).json({ error: "Invalid status" });
            }
            const updatedUser = yield db_1.default.user.update({
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
            yield redisCache_1.cache.evict(`user`, [id]);
            yield redisCache_1.cache.evict(`analytics:dashboard`, [id]);
            res.status(200).json({ user: updatedUser });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    })
];
exports.deleteUserAccount = [
    adminMiddleware_1.requireAdmin,
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            yield db_1.default.user.delete({
                where: { id },
            });
            const deletedCount = yield redisCache_1.cache.evictPattern(`*:${id}:*`);
            res.status(200).json({
                message: "User account deleted successfully",
                cacheEvicted: deletedCount,
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    }),
];
exports.getAdminStories = [
    adminMiddleware_1.requireAdmin,
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;
            const status = req.query.status || "";
            const search = req.query.search || "";
            const cacheKeyArgs = [page.toString(), limit.toString(), status, search];
            const cached = yield redisCache_1.cache.get("admin:stories", cacheKeyArgs);
            if (cached) {
                return res.status(200).json(cached);
            }
            const where = {};
            if (status)
                where.status = status;
            if (search) {
                where.OR = [
                    { title: { contains: search, mode: 'insensitive' } },
                    { subtitle: { contains: search, mode: 'insensitive' } },
                ];
            }
            const stories = yield db_1.default.story.findMany({
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
            const totalStories = yield db_1.default.story.count({ where });
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
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    })
];
exports.moderateStory = [
    adminMiddleware_1.requireAdmin,
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const { status } = req.body;
            if (!["PUBLISHED", "ARCHIVED", "DRAFT"].includes(status)) {
                return res.status(400).json({ error: "Invalid status" });
            }
            const updatedStory = yield db_1.default.story.update({
                where: { id },
                data: { status },
            });
            yield redisCache_1.cache.evict("story", [id]);
            const deletedRelated = yield redisCache_1.cache.evictPattern(`related:${id}:*`);
            res.status(200).json({
                story: updatedStory,
                cacheEvicted: {
                    story: true,
                    related: deletedRelated,
                },
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    }),
];
exports.removeStory = [
    adminMiddleware_1.requireAdmin,
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            yield db_1.default.story.delete({
                where: { id }
            });
            yield redisCache_1.cache.evict(`story:${id}`, [id]);
            yield redisCache_1.cache.evictPattern(`related:${id}:*`);
            res.status(200).json({ message: "Story removed successfully" });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    })
];
exports.getAdminPublications = [
    adminMiddleware_1.requireAdmin,
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;
            const search = req.query.search;
            const status = req.query.status;
            const where = {};
            if (search) {
                where.OR = [
                    { title: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } },
                ];
            }
            if (status)
                where.status = status;
            const publications = yield db_1.default.publication.findMany({
                where,
                include: {
                    owner: {
                        select: { id: true, username: true, name: true, avatar: true },
                    },
                    _count: { select: { stories: true, subscribers: true } },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            });
            const totalPublications = yield db_1.default.publication.count({ where });
            res.status(200).json({
                publications,
                pagination: {
                    page,
                    limit,
                    total: totalPublications,
                    totalPages: Math.ceil(totalPublications / limit),
                },
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    }),
];
exports.moderatePublication = [
    adminMiddleware_1.requireAdmin,
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const { isPublic } = req.body;
            const updatedPublication = yield db_1.default.publication.update({
                where: { id },
                data: { isPublic },
            });
            yield redisCache_1.cache.evict(`publication:${id}`, [id]);
            res.status(200).json({ publication: updatedPublication });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    })
];
exports.getAdminReports = [
    adminMiddleware_1.requireAdmin,
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;
            const status = req.query.status || 'PENDING';
            const type = req.query.type;
            const statusOptions = ['PENDING', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'];
            if (!statusOptions.includes(status)) {
                return res.status(400).json({ error: "Invalid status" });
            }
            const where = { status };
            if (type === 'story')
                where.storyId = { not: null };
            if (type === 'comment')
                where.commentId = { not: null };
            if (type === 'user')
                where.userId = { not: null };
            const reports = yield db_1.default.report.findMany({
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
            const totalReports = yield db_1.default.report.count({ where });
            res.status(200).json({
                reports,
                pagination: {
                    page,
                    limit,
                    total: totalReports,
                    totalPages: Math.ceil(totalReports / limit),
                }
            });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal server error" });
        }
    })
];
exports.resolveReport = [
    adminMiddleware_1.requireAdmin,
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const { status, action } = req.body;
            if (!['RESOLVED', 'DISMISSED'].includes(status)) {
                return res.status(400).json({ error: "Invalid status" });
            }
            const report = yield db_1.default.report.update({
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
                            yield db_1.default.story.delete({ where: { id: report.storyId } });
                            yield redisCache_1.redis.del(`story:${report.storyId}`);
                        }
                        break;
                    case 'DELETE_COMMENT':
                        if (report.commentId) {
                            yield db_1.default.comment.delete({ where: { id: report.commentId } });
                        }
                        break;
                    case 'SUSPEND_USER':
                        if (report.userId) {
                            yield db_1.default.user.update({
                                where: { id: report.userId },
                                data: { status: 'SUSPENDED' }
                            });
                            yield redisCache_1.redis.del(`user:${report.userId}`);
                        }
                        break;
                }
            }
            res.status(200).json({ report });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal server error" });
        }
    })
];
exports.getAdminAnalytics = [
    adminMiddleware_1.requireAdmin,
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const cacheKey = ["admin", "platform"];
            const cachedAnalytics = yield redisCache_1.cache.get("analytics", cacheKey);
            if (cachedAnalytics) {
                return res.status(200).json({ analytics: cachedAnalytics });
            }
            const [userStats, storyStats, publicationStats, engagementStats, monthlyGrowth,] = yield Promise.all([
                db_1.default.user.groupBy({
                    by: ['status'],
                    _count: { id: true },
                }),
                db_1.default.story.aggregate({
                    _count: { id: true },
                    _sum: { viewCount: true, clapCount: true, commentCount: true },
                }),
                db_1.default.publication.aggregate({
                    _count: { id: true },
                }),
                db_1.default.$queryRaw `
                    SELECT 
                        COUNT(DISTINCT rh.user_id) as active_readers,
                        AVG(rh.reading_time) as avg_reading_time,
                        AVG(rh.progress) as avg_progress
                    FROM reading_history rh
                    WHERE rh.last_read_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                `,
                db_1.default.$queryRaw `
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
            yield redisCache_1.cache.set("analytics", cacheKey, analytics, 1800);
            res.status(200).json({ analytics });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal server error" });
        }
    })
];
exports.getSystemHealth = [
    adminMiddleware_1.requireAdmin,
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const cacheKey = ["health"];
            const cachedHealth = yield redisCache_1.cache.get("system", cacheKey);
            if (cachedHealth) {
                return res.status(200).json({ health: cachedHealth });
            }
            const dbStart = Date.now();
            yield db_1.default.$queryRaw `SELECT 1`;
            const dbLatency = Date.now() - dbStart;
            const redisStart = Date.now();
            yield redisCache_1.redis.ping();
            const redisLatency = Date.now() - redisStart;
            const health = {
                database: {
                    status: dbLatency < 100 ? "healthy" :
                        dbLatency < 500 ? "warning" :
                            "critical",
                    latency: dbLatency,
                },
                redis: {
                    status: redisLatency < 50 ? "healthy" :
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
            yield redisCache_1.cache.set("system", cacheKey, health, 60);
            res.status(200).json({ health });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal server error" });
        }
    })
];
exports.getAdminDashboard = [
    adminMiddleware_1.requireAdmin,
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const cacheKey = ["dashboard", "summary"];
            const cached = yield redisCache_1.cache.get("admin", cacheKey);
            if (cached) {
                return res.status(200).json(cached);
            }
            const [totalUsers, activeUsers, totalStories, publishedStories, totalPublications, pendingReports, newUsersThisWeek, newStoriesThisWeek,] = yield Promise.all([
                db_1.default.user.count(),
                db_1.default.user.count({ where: { status: 'ACTIVE' } }),
                db_1.default.story.count(),
                db_1.default.story.count({ where: { status: 'PUBLISHED' } }),
                db_1.default.publication.count(),
                db_1.default.report.count({ where: { status: 'PENDING' } }),
                db_1.default.user.count({
                    where: {
                        createdAt: {
                            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                        }
                    }
                }),
                db_1.default.story.count({
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
            yield redisCache_1.cache.set("admin", cacheKey, dashboardData, 300);
            res.status(200).json(dashboardData);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    })
];
exports.bulkActionStories = [
    adminMiddleware_1.requireAdmin,
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
                    result = yield db_1.default.story.updateMany({
                        where: { id: { in: storyIds } },
                        data: { status: 'PUBLISHED', publishedAt: new Date() }
                    });
                    break;
                case 'ARCHIVE':
                    result = yield db_1.default.story.updateMany({
                        where: { id: { in: storyIds } },
                        data: { status: 'ARCHIVED' }
                    });
                    break;
                case 'DELETE':
                    result = yield db_1.default.story.deleteMany({
                        where: { id: { in: storyIds } }
                    });
                    break;
            }
            yield Promise.all(storyIds.map(id => redisCache_1.cache.evict("story", [id])));
            res.status(200).json({
                message: `Bulk ${action.toLowerCase()} completed`,
                affected: (result === null || result === void 0 ? void 0 : result.count) || 0,
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    })
];
exports.getUserActivityLogs = [
    adminMiddleware_1.requireAdmin,
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { userId } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;
            const [stories, comments, claps, follows] = yield Promise.all([
                db_1.default.story.findMany({
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
                db_1.default.comment.findMany({
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
                db_1.default.clap.findMany({
                    where: { userId },
                    include: {
                        story: {
                            select: { id: true, title: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                }),
                db_1.default.follow.findMany({
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
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    })
];
const requireAdminWithLogging = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.session.user || req.user;
        if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
            return res.status(403).json({ error: "Admin access required" });
        }
        yield db_1.default.adminLog.create({
            data: {
                adminId: user.userId,
                action: `${req.method} ${req.path}`,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent') || 'unknown',
                metadata: {
                    query: req.query,
                    params: req.params
                }
            }
        });
        next();
    }
    catch (err) {
        console.error('Admin middleware error: ', err);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.requireAdminWithLogging = requireAdminWithLogging;
exports.getAdminLogs = [
    exports.requireAdminWithLogging,
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const skip = (page - 1) * limit;
            const adminId = req.query.adminId;
            const action = req.query.action;
            const where = {};
            if (adminId)
                where.adminId = adminId;
            if (action)
                where.action = { contains: action, mode: 'insensitive' };
            const logs = yield db_1.default.adminLog.findMany({
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
            const totalLogs = yield db_1.default.adminLog.count({ where });
            res.status(200).json({
                logs,
                pagination: {
                    page,
                    limit,
                    total: totalLogs,
                    totalPages: Math.ceil(totalLogs / limit),
                }
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    })
];
// Advanced analytics with caching
exports.getAdvancedAnalytics = [
    exports.requireAdminWithLogging,
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const timeframe = req.query.timeframe || '30d';
            const cacheKey = [`analytics:advanced`, timeframe];
            const cached = yield redisCache_1.cache.get("admin", cacheKey);
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
            const [userRegistrations, storyPublications, engagementMetrics, topAuthors, topStories, readerRetention,] = yield Promise.all([
                // User registrations over time
                db_1.default.user.groupBy({
                    by: ['createdAt'],
                    where: { createdAt: { gte: dateFilter } },
                    _count: { id: true },
                    orderBy: { createdAt: 'asc' },
                }),
                // Story publications over time
                db_1.default.story.groupBy({
                    by: ['publishedAt'],
                    where: {
                        publishedAt: { gte: dateFilter },
                        status: 'PUBLISHED'
                    },
                    _count: { id: true },
                    orderBy: { publishedAt: 'asc' },
                }),
                // Engagement metrics
                db_1.default.story.aggregate({
                    where: {
                        publishedAt: { gte: dateFilter },
                        status: 'PUBLISHED'
                    },
                    _avg: { viewCount: true, clapCount: true, commentCount: true },
                    _sum: { viewCount: true, clapCount: true, commentCount: true },
                }),
                // Top authors by engagement
                db_1.default.user.findMany({
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
                db_1.default.story.findMany({
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
                db_1.default.readingHistory.groupBy({
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
            const processedAuthors = topAuthors.map(author => (Object.assign(Object.assign({}, author), { totalViews: author.stories.reduce((sum, story) => sum + (story.viewCount || 0), 0), totalClaps: author.stories.reduce((sum, story) => sum + (story.clapCount || 0), 0), totalComments: author.stories.reduce((sum, story) => sum + (story.commentCount || 0), 0), stories: undefined // Remove stories array from response
             })));
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
            yield redisCache_1.cache.set("admin", cacheKey, analytics, 3600);
            res.status(200).json({ analytics });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    })
];
exports.getModerationQueue = [
    exports.requireAdminWithLogging,
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;
            const priority = req.query.priority; // high, medium, low
            // Get stories that need moderation (based on reports, flags, etc.)
            const moderationItems = yield db_1.default.story.findMany({
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
            const totalItems = yield db_1.default.story.count({
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
                if (reportCount > 5)
                    priorityScore += 3;
                else if (reportCount > 2)
                    priorityScore += 2;
                else if (reportCount > 0)
                    priorityScore += 1;
                if (authorRole === 'READER')
                    priorityScore += 1; // New users get extra scrutiny
                const priority = priorityScore >= 3 ? 'high' : priorityScore >= 1 ? 'medium' : 'low';
                return Object.assign(Object.assign({}, item), { priority,
                    priorityScore });
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
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    })
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
exports.exportUserData = [
    exports.requireAdminWithLogging,
    (0, express_validator_1.param)('userId').isUUID().withMessage('Valid user ID required'),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { userId } = req.params;
            const userData = yield db_1.default.user.findUnique({
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
            const exportData = Object.assign(Object.assign({}, userData), { password: undefined, refreshTokens: undefined });
            res.status(200).json({
                user: exportData,
                exportedAt: new Date(),
                dataTypes: [
                    'profile', 'stories', 'comments', 'claps', 'bookmarks',
                    'followers', 'following', 'reading_history', 'reports', 'notifications'
                ]
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    })
];
// Site-wide notifications
exports.createSiteNotification = [
    exports.requireAdminWithLogging,
    (0, express_validator_1.body)('title').isLength({ min: 1, max: 100 }).withMessage('Title is required (max 100 chars)'),
    (0, express_validator_1.body)('message').isLength({ min: 1, max: 500 }).withMessage('Message is required (max 500 chars)'),
    (0, express_validator_1.body)('type').isIn(['INFO', 'WARNING', 'ERROR', 'SUCCESS']).withMessage('Invalid notification type'),
    (0, express_validator_1.body)('targetUsers').optional().isArray().withMessage('Target users must be an array'),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const { title, message, type, targetUsers, expiresAt } = req.body;
            // If no specific users targeted, send to all active users
            const userIds = targetUsers || (yield db_1.default.user.findMany({
                where: { status: 'ACTIVE' },
                select: { id: true }
            }).then(users => users.map(u => u.id)));
            // Create notifications in batches
            const batchSize = 1000;
            let createdCount = 0;
            for (let i = 0; i < userIds.length; i += batchSize) {
                const batch = userIds.slice(i, i + batchSize);
                const notifications = batch.map((userId) => ({
                    userId,
                    type: type,
                    title,
                    message,
                    data: {
                        isAdminNotification: true,
                        expiresAt: expiresAt || null
                    }
                }));
                yield db_1.default.notification.createMany({
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
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    })
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
exports.validateUserUpdate = [
    (0, express_validator_1.param)('id').isUUID().withMessage('Valid user ID required'),
    (0, express_validator_1.body)('status').isIn(['ACTIVE', 'SUSPENDED', 'BANNED']).withMessage('Invalid status'),
    (0, express_validator_1.body)('reason').optional().isLength({ min: 10, max: 500 }).withMessage('Reason must be 10-500 characters'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];
exports.validateStoryModeration = [
    (0, express_validator_1.param)('id').isUUID().withMessage('Valid story ID required'),
    (0, express_validator_1.body)('status').isIn(['PUBLISHED', 'ARCHIVED', 'DRAFT']).withMessage('Invalid status'),
    (0, express_validator_1.body)('reason').optional().isLength({ min: 10, max: 500 }).withMessage('Reason must be 10-500 characters'),
    (req, res, next) => {
        const error = (0, express_validator_1.validationResult)(req);
        if (!error.isEmpty()) {
            return res.status(400).json({ errors: error.array() });
        }
        next();
    }
];
exports.validatePublicationUpdate = [
    (0, express_validator_1.param)('id').isUUID().withMessage('Valid publication ID required'),
    (0, express_validator_1.body)('status').isIn(['PUBLISHED', 'ARCHIVED', 'DRAFT']).withMessage('Invalid status'),
    (0, express_validator_1.body)('reason').optional().isLength({ min: 10, max: 500 }).withMessage('Reason must be 10-500 characters'),
    (req, res, next) => {
        const error = (0, express_validator_1.validationResult)(req);
        if (!error.isEmpty()) {
            return res.status(400).json({ errors: error.array() });
        }
        next();
    }
];
