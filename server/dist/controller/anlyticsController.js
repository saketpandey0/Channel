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
exports.getEarningsAnalytics = exports.getPublicationAnalytics = exports.getDashboardAnalytics = exports.getStoryAnalytics = void 0;
const db_1 = __importDefault(require("../db"));
const redisCache_1 = require("../cache/redisCache");
const getStoryAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const userId = (_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }
        const story = yield db_1.default.story.findUnique({
            where: { id },
            include: {
                author: true,
            }
        });
        if (!story) {
            return res.status(404).json({ error: "Story not found" });
        }
        if (story.authorId !== userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }
        const cacheKey = "analytics:story";
        const cachedAnalytics = yield redisCache_1.cache.get(cacheKey, [id]);
        if (cachedAnalytics) {
            return res.status(200).json(JSON.parse(cachedAnalytics));
        }
        const [readingStats, dailyViews, topReferrers, readerCountries] = yield Promise.all([
            db_1.default.readingHistory.aggregate({
                where: {
                    storyId: id,
                },
                _avg: {
                    progress: true,
                    readingTime: true,
                },
                _count: {
                    id: true,
                }
            }),
            //Daily views for late 30 Days
            db_1.default.$queryRaw `                                       
                SELECT DATE(created_at) as date, COUNT(*) as count
                FROM reading_history
                WHERE story_id = ${id}
                AND created_at >= NOW() - INTERVAL 30 DAY
                GROUP BY DATE(created_at)
                ORDER BY date ASC
            `,
            //Top referrers
            db_1.default.$queryRaw `
                SELECT referrers, COUNT(*) as count
                FROM  story_views
                WHERE story_id = ${id}
                GROUP BY referrers
                ORDERBY count DESC
                LIMIT 10
            `,
            //Reader countries
            db_1.default.$queryRaw `
                SELECT country, COUNT(*) as readers
                FROM reading_history rh
                JOIN user_location ul ON rh.user_id = ul.user_id
                WHERE story_id = ${id}
                GROUP BY country
                ORDER BY readers DESC
                LIMIT 10
            `
        ]);
        const analytics = {
            views: story.viewCount,
            claps: story.clapCount,
            comments: story.commentCount,
            bookmarks: story.bookmarkCount,
            reads: readingStats._count.id,
            averageReadTime: readingStats._avg.readingTime || 0,
            averageProgress: readingStats._avg.progress || 0,
            dailyViews,
            topReferrers,
            readerCountries,
            engagementRate: story.viewCount > 0 ? (story.clapCount + story.commentCount) / story.viewCount : 0,
        };
        yield redisCache_1.cache.set(cacheKey, [id], analytics, 300);
        res.status(200).json({ analytics });
    }
    catch (error) {
        console.error("Error getting story analytics:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getStoryAnalytics = getStoryAnalytics;
const getDashboardAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.session.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        const cacheKey = `analytics:dashboard`;
        const cachedDashboard = yield redisCache_1.cache.get(cacheKey, [userId]);
        if (cachedDashboard) {
            return res.status(200).json({ analytics: JSON.parse(cachedDashboard) });
        }
        const [totalStats, recentStories, monthlyStats, topStories,] = yield Promise.all([
            // Total statistics
            db_1.default.story.aggregate({
                where: { authorId: userId, status: 'PUBLISHED' },
                _sum: { viewCount: true, clapCount: true, commentCount: true, bookmarkCount: true },
                _count: { id: true },
            }),
            // Recent stories performance
            db_1.default.story.findMany({
                where: { authorId: userId, status: 'PUBLISHED' },
                select: {
                    id: true,
                    title: true,
                    viewCount: true,
                    clapCount: true,
                    commentCount: true,
                    publishedAt: true,
                },
                orderBy: { publishedAt: 'desc' },
                take: 5,
            }),
            // Monthly statistics
            db_1.default.$queryRaw `
        SELECT 
          DATE_FORMAT(published_at, '%Y-%m') as month,
          COUNT(*) as stories_published,
          SUM(view_count) as total_views,
          SUM(clap_count) as total_claps
        FROM stories 
        WHERE author_id = ${userId} 
        AND status = 'PUBLISHED'
        AND published_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(published_at, '%Y-%m')
        ORDER BY month DESC
      `,
            // Top performing stories
            db_1.default.story.findMany({
                where: { authorId: userId, status: 'PUBLISHED' },
                select: {
                    id: true,
                    title: true,
                    viewCount: true,
                    clapCount: true,
                    commentCount: true,
                    publishedAt: true,
                },
                orderBy: { viewCount: 'desc' },
                take: 10,
            }),
        ]);
        const analytics = {
            totalStories: totalStats._count.id,
            totalViews: totalStats._sum.viewCount || 0,
            totalClaps: totalStats._sum.clapCount || 0,
            totalComments: totalStats._sum.commentCount || 0,
            totalBookmarks: totalStats._sum.bookmarkCount || 0,
            recentStories,
            monthlyStats,
            topStories,
            averageViewsPerStory: totalStats._count.id > 0 ? (totalStats._sum.viewCount || 0) / totalStats._count.id : 0,
        };
        yield redisCache_1.cache.set(cacheKey, [userId], analytics, 600);
        res.status(200).json({ analytics });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getDashboardAnalytics = getDashboardAnalytics;
const getPublicationAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.session.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        const publication = yield db_1.default.publication.findUnique({
            where: { id },
            include: {
                editors: { where: { userId } }
            }
        });
        if (!publication) {
            return res.status(404).json({ error: "Publication not found" });
        }
        const isOwner = publication.ownerId === userId;
        const isEditor = publication.editors.length > 0;
        if (!isOwner && !isEditor) {
            return res.status(403).json({ error: "Access denied" });
        }
        const cacheKey = `analytics:publication`;
        const cachedAnalytics = yield redisCache_1.cache.get(cacheKey, [id]);
        if (cachedAnalytics) {
            return res.status(200).json({ analytics: JSON.parse(cachedAnalytics) });
        }
        const [storyStats, authorStats, monthlyGrowth, topStories,] = yield Promise.all([
            // Story statistics
            db_1.default.story.aggregate({
                where: { publicationId: id, status: 'PUBLISHED' },
                _sum: { viewCount: true, clapCount: true, commentCount: true, bookmarkCount: true },
                _count: { id: true },
            }),
            // Author statistics
            db_1.default.$queryRaw `
        SELECT 
          u.display_name,
          u.username,
          COUNT(s.id) as story_count,
          SUM(s.view_count) as total_views
        FROM stories s
        JOIN users u ON s.author_id = u.id
        WHERE s.publication_id = ${id}
        AND s.status = 'PUBLISHED'
        GROUP BY u.id
        ORDER BY total_views DESC
        LIMIT 10
      `,
            // Monthly growth
            db_1.default.$queryRaw `
        SELECT 
          DATE_FORMAT(published_at, '%Y-%m') as month,
          COUNT(*) as stories_published,
          SUM(view_count) as total_views
        FROM stories 
        WHERE publication_id = ${id}
        AND status = 'PUBLISHED'
        AND published_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(published_at, '%Y-%m')
        ORDER BY month DESC
      `,
            // Top stories
            db_1.default.story.findMany({
                where: { publicationId: id, status: 'PUBLISHED' },
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            name: true,
                            avatar: true,
                        }
                    }
                },
                orderBy: { viewCount: 'desc' },
                take: 10,
            }),
        ]);
        const analytics = {
            totalStories: storyStats._count.id,
            totalViews: storyStats._sum.viewCount || 0,
            totalClaps: storyStats._sum.clapCount || 0,
            totalComments: storyStats._sum.commentCount || 0,
            totalBookmarks: storyStats._sum.bookmarkCount || 0,
            topAuthors: authorStats,
            monthlyGrowth,
            topStories,
        };
        yield redisCache_1.cache.set(cacheKey, [id], analytics, 900);
        res.status(200).json({ analytics });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getPublicationAnalytics = getPublicationAnalytics;
const getEarningsAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.session.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        // Todo -> This would integrate with payment processing (Stripe, etc.)
        const cacheKey = `analytics:earnings`;
        const cachedEarnings = yield redisCache_1.cache.get(cacheKey, [userId]);
        if (cachedEarnings) {
            return res.status(200).json({ earnings: JSON.parse(cachedEarnings) });
        }
        // Mock earnings data - replace with actual payment provider integration
        const earnings = {
            totalEarnings: 0,
            monthlyEarnings: 0,
            paidStories: 0,
            subscribers: 0,
            monthlyBreakdown: [],
            paymentHistory: [],
        };
        yield redisCache_1.cache.set(cacheKey, [userId], earnings, 3600);
        res.status(200).json({ earnings });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getEarningsAnalytics = getEarningsAnalytics;
