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
exports.getSystemHealth = exports.getAdminAnalytics = exports.resolveReport = exports.getAdminReports = exports.moderatePublication = exports.getAdminPublications = exports.removeStory = exports.moderateStory = exports.getAdminStories = exports.deleteUserAccount = exports.updateUserStatus = exports.getAdminUsers = void 0;
const db_1 = __importDefault(require("../db"));
const redisCache_1 = require("../cache/redisCache");
const adminMiddleware_1 = require("../middlewares/adminMiddleware");
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
            const { status, reason } = req.body;
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
            const publications = yield db_1.default.publication.findMany({
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
            const totalPublications = yield db_1.default.publication.count();
            res.status(200).json({
                publications,
                pagination: {
                    page,
                    limit,
                    total: totalPublications,
                    totalPages: Math.ceil(totalPublications / limit),
                }
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    })
];
exports.moderatePublication = [
    adminMiddleware_1.requireAdmin,
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const { isPublic, reason } = req.body;
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
            const statusOptions = ['UNDER_REVIEW', 'RESOLVED', 'DISMISSED'];
            if (statusOptions.includes(status)) {
                return res.status(400).json({ error: "Invalid status" });
            }
            if (status !== 'PENDING') {
                return res.status(400).json({ error: "Invalid status" });
            }
            const reports = yield db_1.default.report.findMany({
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
            const totalReports = yield db_1.default.report.count({ where: { status } });
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
