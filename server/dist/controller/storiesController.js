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
exports.restoreStoryVersion = exports.getStoryVersions = exports.getStoriesStats = exports.getUserPublishedStories = exports.getUserDrafts = exports.unpublishStory = exports.publishStory = exports.getTrendingStories = exports.getFeed = exports.deleteStory = exports.updateStory = exports.getStories = exports.getStory = exports.createStory = void 0;
const storyValidation_1 = __importDefault(require("../validators/storyValidation"));
const db_1 = __importDefault(require("../db"));
const generateSlug_1 = require("../utils/generateSlug");
const calcReadTime_1 = require("../utils/calcReadTime");
const redisCache_1 = require("../cache/redisCache"); // Import your cache
const createStory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const userId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { success, data } = storyValidation_1.default.safeParse(req.body);
        if (!success) {
            return res.status(400).json({ error: "Invalid story data", issues: data });
        }
        const { title, subtitle, content, excerpt, coverImage, tags, publicationId, isPremium, allowComments, allowClaps, mediaIds } = data;
        const slug = (0, generateSlug_1.generateSlug)(title);
        const readTime = (0, calcReadTime_1.calcReadTime)(content);
        const wordCount = content.split(/\s+/).length;
        const plainTextContent = content.replace(/<[^>]+>/g, '');
        const newStory = yield db_1.default.story.create({
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
                media: true,
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
                const tag = yield db_1.default.tag.upsert({
                    where: {
                        name: tagName
                    },
                    create: {
                        name: tagName,
                        slug: (0, generateSlug_1.generateSlug)(tagName)
                    },
                    update: {}
                });
                yield db_1.default.storyTag.create({
                    data: {
                        storyId: newStory.id,
                        tagId: tag.id
                    }
                });
            }
        }
        if (mediaIds && mediaIds.length > 0) {
            for (const [index, mediaId] of mediaIds.entries()) {
                yield db_1.default.storyMedia.create({
                    data: {
                        storyId: newStory.id,
                        mediaId,
                        order: index
                    }
                });
            }
        }
        yield redisCache_1.cache.evictPattern(`stories:author:${userId}:*`);
        yield redisCache_1.cache.evictPattern(`user:${userId}:drafts:*`);
        res.status(201).json(newStory);
    }
    catch (error) {
        console.error("Error creating blog post:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.createStory = createStory;
const getStory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const userId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId) || 'anonymous';
        const cachedStory = yield redisCache_1.cache.get('story', [id, userId]);
        if (cachedStory) {
            return res.status(200).json(cachedStory);
        }
        const story = yield db_1.default.story.findUnique({
            where: { id },
            include: {
                media: true,
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
        yield redisCache_1.cache.set('story', [id, userId], story, 600);
        if (userId !== 'anonymous') {
            db_1.default.story.update({
                where: { id },
                data: {
                    viewCount: { increment: 1 },
                    lastViewedAt: new Date()
                },
            }).catch(err => console.error('Error updating view count:', err));
            db_1.default.readingHistory.upsert({
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
            }).catch(err => console.error('Error updating reading history:', err));
        }
        res.status(200).json(story);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getStory = getStory;
const getStories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const tag = req.query.tag;
        const authorId = req.query.authorId;
        const publicationId = req.query.publicationId;
        const search = req.query.search;
        const status = req.query.status;
        const cacheKey = [
            'page', page.toString(),
            'limit', limit.toString(),
            ...(tag ? ['tag', tag] : []),
            ...(authorId ? ['author', authorId] : []),
            ...(publicationId ? ['publication', publicationId] : []),
            ...(search ? ['search', search] : []),
            ...(status ? ['status', status] : [])
        ];
        const cachedResult = yield redisCache_1.cache.get('stories', cacheKey);
        if (cachedResult) {
            return res.status(200).json(cachedResult);
        }
        const where = Object.assign(Object.assign({}, (status ? { status } : { status: 'PUBLISHED' })), { isPublic: true });
        if (tag) {
            where.tags = {
                some: {
                    tag: { slug: tag }
                }
            };
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
            ];
        }
        const stories = yield db_1.default.story.findMany({
            where,
            include: {
                author: { select: { id: true, username: true, name: true, avatar: true } },
                publication: { select: { id: true, name: true, slug: true, logo: true } },
                tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
                media: true,
                _count: { select: { claps: true, comments: true, bookmarks: true } }
            },
            orderBy: { publishedAt: 'desc' },
            skip,
            take: limit
        });
        const totalStories = yield db_1.default.story.count({ where });
        const result = {
            stories,
            pagination: {
                page,
                limit,
                total: totalStories,
                totalPages: Math.ceil(totalStories / limit),
            }
        };
        yield redisCache_1.cache.set('stories', cacheKey, result, 300);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error fetching stories:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getStories = getStories;
const updateStory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    try {
        const { id } = req.params;
        const userId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        const story = yield db_1.default.story.findUnique({
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
        const { success, data } = storyValidation_1.default.safeParse(req.body);
        if (!success) {
            return res.status(400).json({ error: "Invalid story data" });
        }
        const { title, subtitle, content, excerpt, coverImage, tags, publicationId, isPremium, allowComments, allowClaps, mediaIds } = data;
        const slug = title ? (0, generateSlug_1.generateSlug)(title) : story.slug;
        const readTime = content ? (0, calcReadTime_1.calcReadTime)(content) : story.readTime;
        const wordCount = content ? content.split(/\s+/).length : story.wordCount;
        const plainTextContent = content ? content.replace(/<[^>]*>/g, '') : story.plainTextContent;
        yield db_1.default.storyVersion.create({
            data: {
                storyId: id,
                version: ((_d = story.versions) === null || _d === void 0 ? void 0 : _d.length) ? story.versions.length + 1 : 1,
                title: story.title,
                content: story.content,
                changes: `Updated by ${(_f = (_e = req.session) === null || _e === void 0 ? void 0 : _e.user) === null || _f === void 0 ? void 0 : _f.name}`,
            },
        });
        const updatedStory = yield db_1.default.story.update({
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
                },
                media: true
            }
        });
        if (tags) {
            yield db_1.default.storyTag.deleteMany({
                where: {
                    storyId: id
                }
            });
            for (const tagName of tags) {
                const tag = yield db_1.default.tag.upsert({
                    where: {
                        name: tagName
                    },
                    create: {
                        name: tagName,
                        slug: (0, generateSlug_1.generateSlug)(tagName)
                    },
                    update: {}
                });
                yield db_1.default.storyTag.create({
                    data: {
                        storyId: id,
                        tagId: tag.id
                    }
                });
            }
        }
        if (mediaIds && mediaIds.length > 0) {
            for (const [index, mediaId] of mediaIds.entries()) {
                yield db_1.default.storyMedia.create({
                    data: {
                        storyId: id,
                        mediaId,
                        order: index
                    }
                });
            }
        }
        yield redisCache_1.cache.evictPattern(`story:${id}:*`);
        yield redisCache_1.cache.evictPattern(`stories:*`);
        yield redisCache_1.cache.evictPattern(`user:${userId}:*`);
        if (story.publicationId) {
            yield redisCache_1.cache.evictPattern(`stories:*publication:${story.publicationId}*`);
        }
        res.status(200).json({ story: updatedStory });
    }
    catch (err) {
        console.error("Error", err);
        return res.status(500).json({ err: "Internal server error" });
    }
});
exports.updateStory = updateStory;
const deleteStory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const userId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
        if (!userId) {
            return res.status(401).json({ error: "Authentication Required" });
        }
        const story = yield db_1.default.story.findUnique({
            where: { id }
        });
        if (!story) {
            return res.status(404).json({ error: "Story not Found" });
        }
        if (story.authorId !== userId) {
            return res.status(403).json({ error: "Access denied" });
        }
        yield db_1.default.story.delete({
            where: { id }
        });
        yield redisCache_1.cache.evictPattern(`story:${id}:*`);
        yield redisCache_1.cache.evictPattern(`stories:*`);
        yield redisCache_1.cache.evictPattern(`user:${userId}:*`);
        if (story.publicationId) {
            yield redisCache_1.cache.evictPattern(`stories:*publication:${story.publicationId}*`);
        }
        res.status(200).json({ message: "Story deleted Successfully" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.deleteStory = deleteStory;
const getFeed = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const userId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Accesss" });
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const cacheKey = ['feed', userId, page.toString(), limit.toString()];
        const cachedFeed = yield redisCache_1.cache.get('user', cacheKey);
        if (cachedFeed) {
            return res.status(200).json(cachedFeed);
        }
        const following = yield db_1.default.follow.findMany({
            where: {
                followerId: userId
            },
            select: {
                followingId: true
            }
        });
        const followingIds = following.map(f => f.followingId);
        const stories = yield db_1.default.story.findMany({
            where: {
                status: 'PUBLISHED',
                isPublic: true,
                authorId: {
                    in: followingIds
                }
            },
            include: {
                media: true,
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
        });
        const result = { stories };
        yield redisCache_1.cache.set('user', cacheKey, result, 300);
        res.status(200).json(result);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getFeed = getFeed;
const getTrendingStories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const userId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Accesss" });
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Try to get from cache first
        const cacheKey = ['trending', page.toString(), limit.toString()];
        const cachedTrending = yield redisCache_1.cache.get('stories', cacheKey);
        if (cachedTrending) {
            return res.status(200).json(cachedTrending);
        }
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const stories = yield db_1.default.story.findMany({
            where: {
                status: 'PUBLISHED',
                isPublic: true,
                publishedAt: {
                    gte: sevenDaysAgo
                }
            },
            include: {
                media: true,
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
        const result = { stories };
        yield redisCache_1.cache.set('stories', cacheKey, result, 600);
        res.status(200).json(result);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getTrendingStories = getTrendingStories;
const publishStory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const userId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        const story = yield db_1.default.story.findUnique({
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
        const updatedStory = yield db_1.default.story.update({
            where: { id },
            data: {
                status: 'PUBLISHED',
                publishedAt: new Date(),
            },
            include: {
                media: true,
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
        yield redisCache_1.cache.evictPattern(`story:${id}:*`);
        yield redisCache_1.cache.evictPattern(`stories:*`);
        yield redisCache_1.cache.evictPattern(`user:${userId}:*`);
        if (story.publicationId) {
            yield redisCache_1.cache.evictPattern(`stories:*publication:${story.publicationId}*`);
        }
        res.status(200).json({ story: updatedStory });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.publishStory = publishStory;
const unpublishStory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const userId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        const story = yield db_1.default.story.findUnique({
            where: { id }
        });
        if (!story) {
            return res.status(404).json({ error: "Story not found" });
        }
        if (story.authorId !== userId) {
            return res.status(403).json({ error: "Access denied" });
        }
        const updatedStory = yield db_1.default.story.update({
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
        yield redisCache_1.cache.evictPattern(`story:${id}:*`);
        yield redisCache_1.cache.evictPattern(`stories:*`);
        yield redisCache_1.cache.evictPattern(`user:${userId}:*`);
        if (story.publicationId) {
            yield redisCache_1.cache.evictPattern(`stories:*publication:${story.publicationId}*`);
        }
        res.status(200).json({ story: updatedStory });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.unpublishStory = unpublishStory;
const getUserDrafts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const userId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        const cachedDrafts = yield redisCache_1.cache.get('user', [userId, 'drafts']);
        if (cachedDrafts) {
            return res.status(200).json(cachedDrafts);
        }
        const drafts = yield db_1.default.story.findMany({
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
                },
                media: true
            },
            orderBy: { updatedAt: 'desc' },
        });
        const result = { drafts };
        yield redisCache_1.cache.set('user', [userId, 'drafts'], result, 300);
        res.status(200).json(result);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getUserDrafts = getUserDrafts;
const getUserPublishedStories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const userId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        const cachedStories = yield redisCache_1.cache.get('user', [userId, 'published']);
        if (cachedStories) {
            return res.status(200).json(cachedStories);
        }
        const stories = yield db_1.default.story.findMany({
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
                media: true,
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
        const result = { stories };
        yield redisCache_1.cache.set('user', [userId, 'published'], result, 300);
        res.status(200).json(result);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getUserPublishedStories = getUserPublishedStories;
const getStoriesStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const userId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Accesss" });
        }
        const cachedStats = yield redisCache_1.cache.get('story', [id, 'stats']);
        if (cachedStats) {
            return res.status(200).json(cachedStats);
        }
        const story = yield db_1.default.story.findUnique({
            where: { id },
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
        if (!story) {
            return res.status(404).json({ error: "Story not found" });
        }
        if (story.status !== "PUBLISHED" && story.authorId !== userId) {
            return res.status(403).json({ error: "Access denied" });
        }
        const readingStats = yield db_1.default.readingHistory.aggregate({
            where: { storyId: id },
            _avg: { progress: true },
            _count: { id: true }
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
        const result = { stats };
        yield redisCache_1.cache.set('story', [id, 'stats'], result, 120);
        res.status(200).json(result);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getStoriesStats = getStoriesStats;
const getStoryVersions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const userId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Accesss" });
        }
        const story = yield db_1.default.story.findUnique({
            where: { id },
        });
        if (!story) {
            return res.status(404).json({ error: "Story not found" });
        }
        if (story.authorId !== userId) {
            return res.status(401).json({ error: "Unauthorized Accesss" });
        }
        const cachedVersions = yield redisCache_1.cache.get('story', [id, 'versions']);
        if (cachedVersions) {
            return res.status(200).json(cachedVersions);
        }
        const versions = yield db_1.default.storyVersion.findMany({
            where: { storyId: id },
            orderBy: { version: 'desc' }
        });
        const result = { versions };
        yield redisCache_1.cache.set('story', [id, 'versions'], result, 900);
        res.status(200).json(result);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getStoryVersions = getStoryVersions;
const restoreStoryVersion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id, versionId } = req.params;
        const userId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId) || 'anonymous';
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Accesss" });
        }
        const story = yield db_1.default.story.findUnique({
            where: { id },
        });
        if (!story) {
            return res.status(404).json({ error: "Story not found" });
        }
        if (story.authorId !== userId) {
            return res.status(401).json({ error: "Unauthorized Accesss" });
        }
        const version = yield db_1.default.storyVersion.findUnique({
            where: { id: versionId }
        });
        if (!version) {
            return res.status(404).json({ error: "Version not found" });
        }
        if (version.storyId !== id) {
            return res.status(401).json({ error: "Unauthorized Accesss" });
        }
        const updatedStory = yield db_1.default.story.update({
            where: { id },
            data: {
                title: version.title,
                content: version.content,
                status: 'DRAFT',
                publishedAt: null,
                updatedAt: new Date(),
            }
        });
        yield redisCache_1.cache.evictPattern(`story:${id}:*`);
        yield redisCache_1.cache.evictPattern(`stories:*`);
        yield redisCache_1.cache.evictPattern(`user:${userId}:*`);
        if (story.publicationId) {
            yield redisCache_1.cache.evictPattern(`stories:*publication:${story.publicationId}*`);
        }
        res.status(200).json({ story: updatedStory });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.restoreStoryVersion = restoreStoryVersion;
