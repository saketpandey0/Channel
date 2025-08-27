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
exports.contentSearch = exports.getUserBookmarks = exports.removeBookmark = exports.bookmarkStory = exports.getUserFollowing = exports.getUserFollowers = exports.unfollowUser = exports.followStatus = exports.followUser = exports.replycomment = exports.deleteComment = exports.updateComment = exports.removeClapComment = exports.clapComment = exports.getComments = exports.addComment = exports.storyClapStatus = exports.getStoryClaps = exports.removeClap = exports.clapStory = void 0;
const db_1 = __importDefault(require("../db"));
const commentValidation_1 = __importDefault(require("../validators/commentValidation"));
const redisCache_1 = require("../cache/redisCache");
const clapStory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const userId = ((_a = req.session.user) === null || _a === void 0 ? void 0 : _a.userId) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId);
        const user = req.user;
        console.log("user logging:", user);
        console.log("logging userId:", userId);
        console.log("req.user:", req.user);
        console.log("req.session.user:", (_c = req.session) === null || _c === void 0 ? void 0 : _c.user);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }
        const story = yield db_1.default.story.findUnique({
            where: { id },
        });
        if (!story) {
            return res.status(404).json({ error: "Story not found" });
        }
        if (!story.allowClaps) {
            return res.status(401).json({ error: "Story does not allow claps" });
        }
        const existingClap = yield db_1.default.clap.findUnique({
            where: {
                userId_storyId: {
                    userId,
                    storyId: id
                }
            }
        });
        if (existingClap) {
            console.log("clapped Already");
            return res.status(400).json({ err: "Story already clapped" });
        }
        const clap = yield db_1.default.clap.create({
            data: {
                userId,
                storyId: id,
                count: 1,
            }
        });
        const totalClaps = yield db_1.default.clap.aggregate({
            where: {
                storyId: id
            },
            _sum: {
                count: true
            }
        });
        yield db_1.default.story.update({
            where: { id },
            data: {
                clapCount: totalClaps._sum.count || 0,
            }
        });
        yield redisCache_1.cache.evict("story_claps", [id]);
        yield redisCache_1.cache.evict("user_clapped", [userId, id]);
        res.status(200).json({ msg: "Story clapped successfully" });
        console.log("clapping");
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
exports.clapStory = clapStory;
const removeClap = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const userId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }
        const story = yield db_1.default.story.findUnique({
            where: { id },
        });
        if (!story) {
            return res.status(404).json({ error: "Story not found" });
        }
        if (!story.allowClaps) {
            return res.status(401).json({ error: "Story does not allow claps" });
        }
        yield db_1.default.clap.delete({
            where: {
                userId_storyId: {
                    userId,
                    storyId: id
                }
            }
        });
        const totalClaps = yield db_1.default.clap.aggregate({
            where: {
                storyId: id
            },
            _sum: {
                count: true
            }
        });
        yield db_1.default.story.update({
            where: { id },
            data: {
                clapCount: totalClaps._sum.count || 0,
            }
        });
        yield redisCache_1.cache.evict("story_claps", [id]);
        yield redisCache_1.cache.evict("user_clapped", [userId, id]);
        res.status(200).json({ msg: "Clap removed successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
exports.removeClap = removeClap;
const getStoryClaps = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const userId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
        if (!userId) {
            return res.json({
                err: "Unauthorized Access"
            });
        }
        const cacheKey = userId ? `${id}_${userId}` : id;
        const cachedData = yield redisCache_1.cache.get("story_claps", [cacheKey]);
        if (cachedData) {
            return res.status(200).json(cachedData);
        }
        const story = yield db_1.default.story.findUnique({
            where: { id },
        });
        if (!story) {
            return res.status(404).json({ error: "Story not found" });
        }
        if (!story.allowClaps) {
            return res.status(401).json({ error: "Story does not allow claps" });
        }
        const totalClaps = yield db_1.default.clap.aggregate({
            where: {
                storyId: id
            },
            _sum: {
                count: true
            },
            _count: {
                id: true
            }
        });
        let userClaps = null;
        if (userId) {
            userClaps = yield db_1.default.clap.findUnique({
                where: {
                    userId_storyId: {
                        userId,
                        storyId: id
                    }
                }
            });
        }
        const recentClaps = yield db_1.default.clap.findMany({
            where: {
                storyId: id,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            },
            take: 10
        });
        const responseData = {
            totalClaps: totalClaps._sum.count || 0,
            totalClapers: totalClaps._count.id || 0,
            userClaps: (userClaps === null || userClaps === void 0 ? void 0 : userClaps.count) || 0,
            recentClaps
        };
        yield redisCache_1.cache.set("story_claps", [cacheKey], responseData, 300);
        res.status(200).json(responseData);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
exports.getStoryClaps = getStoryClaps;
const storyClapStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const userId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }
        const story = yield db_1.default.story.findUnique({
            where: { id },
        });
        if (!story) {
            return res.status(404).json({ error: "Story not found" });
        }
        if (!story.allowClaps) {
            return res.status(401).json({ error: "Story does not allow claps" });
        }
        const cacheKey = `clap:status`;
        const cachedData = yield redisCache_1.cache.get(cacheKey, [userId, id]);
        const existingClap = yield db_1.default.clap.findUnique({
            where: {
                userId_storyId: {
                    userId,
                    storyId: id
                }
            }
        });
        if (existingClap) {
            return res.status(200).json({ clap: !!existingClap });
        }
        yield redisCache_1.cache.set(cacheKey, [userId, id], { clap: false }, 60);
        res.status(200).json({ clap: false });
    }
    catch (error) {
    }
});
exports.storyClapStatus = storyClapStatus;
const addComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const userId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }
        const story = yield db_1.default.story.findUnique({
            where: { id },
        });
        if (!story) {
            return res.status(404).json({ error: "Story not found" });
        }
        if (!story.allowComments) {
            return res.status(401).json({ error: "Story does not allow comments" });
        }
        const { success, data } = commentValidation_1.default.safeParse(req.body);
        if (!success) {
            return res.status(400).json({ error: "Invalid comment data" });
        }
        const comment = yield db_1.default.comment.create({
            data: {
                content: data.content,
                authorId: userId,
                storyId: id,
                parentId: data.parentId,
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
                _count: {
                    select: {
                        replies: true
                    }
                }
            }
        });
        const commentCount = yield db_1.default.comment.count({
            where: {
                storyId: id
            }
        });
        yield db_1.default.story.update({
            where: { id },
            data: {
                commentCount
            }
        });
        if (data.parentId) {
            const replyCount = yield db_1.default.comment.count({
                where: {
                    parentId: data.parentId
                }
            });
            yield db_1.default.comment.update({
                where: { id: data.parentId },
                data: {
                    replyCount
                }
            });
        }
        ;
        yield redisCache_1.cache.evictPattern(`story_comments:${id}:*`);
        res.status(200).json({ msg: "Comment added successfully", comment });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
exports.addComment = addComment;
const getComments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const userId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const cachedData = yield redisCache_1.cache.get("story_comments", [id, page.toString(), limit.toString()]);
        if (cachedData) {
            return res.status(200).json(cachedData);
        }
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }
        const story = yield db_1.default.story.findUnique({
            where: { id },
        });
        if (!story) {
            return res.status(404).json({ error: "Story not found" });
        }
        if (!story.allowComments) {
            return res.status(401).json({ error: "Story does not allow comments" });
        }
        const comments = yield db_1.default.comment.findMany({
            where: {
                storyId: id,
                parentId: null
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
                replies: {
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
                        _count: {
                            select: {
                                replies: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 3
                },
                _count: {
                    select: {
                        replies: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limit
        });
        const totalComments = yield db_1.default.comment.count({
            where: {
                storyId: id,
                parentId: null
            }
        });
        const responseData = {
            comments,
            pagination: {
                page,
                limit,
                total: totalComments,
                totalPages: Math.ceil(totalComments / limit),
            }
        };
        yield redisCache_1.cache.set("story_comments", [id, page.toString(), limit.toString()], responseData, 120);
        res.status(200).json(responseData);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getComments = getComments;
const clapComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const userId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }
        const comment = yield db_1.default.comment.findUnique({
            where: { id }
        });
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }
        const existingClap = yield db_1.default.clapComment.findUnique({
            where: {
                userId_commentId: {
                    userId,
                    commentId: id
                }
            }
        });
        if (existingClap) {
            return res.status(400).json({ error: "Comment already clapped" });
        }
        const clap = yield db_1.default.clapComment.create({
            data: {
                userId,
                commentId: id,
                count: 1,
            }
        });
        const totalClaps = yield db_1.default.clapComment.aggregate({
            where: {
                commentId: id
            },
            _sum: {
                count: true
            }
        });
        yield db_1.default.comment.update({
            where: { id },
            data: {
                clapCount: totalClaps._sum.count || 0,
            }
        });
        yield redisCache_1.cache.evictPattern(`story_comments:${comment.storyId}:*`);
        res.status(200).json({ msg: "Comment clapped successfully" });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
});
exports.clapComment = clapComment;
const removeClapComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const userId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }
        const comment = yield db_1.default.comment.findUnique({
            where: { id }
        });
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }
        yield db_1.default.clapComment.delete({
            where: {
                userId_commentId: {
                    userId,
                    commentId: id
                }
            }
        });
        const commentCount = yield db_1.default.comment.count({
            where: {
                storyId: comment.storyId
            }
        });
        yield db_1.default.story.update({
            where: {
                id: comment.storyId
            },
            data: {
                commentCount
            }
        });
        yield redisCache_1.cache.evictPattern(`story_comments:${comment.storyId}:*`);
        res.status(200).json({ msg: "Comment clapped successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
exports.removeClapComment = removeClapComment;
const updateComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const userId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
        const { content } = req.body;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }
        if (!content) {
            return res.status(400).json({ error: "Comment content is required" });
        }
        const comment = yield db_1.default.comment.findUnique({
            where: {
                id
            }
        });
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }
        if (comment.authorId !== userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }
        const updatedComment = yield db_1.default.comment.update({
            where: { id },
            data: {
                content,
                isEdited: true,
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
                }
            }
        });
        yield redisCache_1.cache.evictPattern(`story_comments:${comment.storyId}:*`);
        res.status(200).json({ comment: updatedComment });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
exports.updateComment = updateComment;
const deleteComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const userId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }
        const comment = yield db_1.default.comment.findUnique({
            where: { id }
        });
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }
        const isCommentAuthor = comment.authorId === userId;
        const isStoryOwner = comment.storyId === userId;
        if (!isCommentAuthor && !isStoryOwner) {
            return res.status(401).json({
                error: "Unauthorized Access"
            });
        }
        ;
        yield db_1.default.comment.delete({
            where: {
                id
            }
        });
        const commentCount = yield db_1.default.comment.count({
            where: {
                storyId: comment.storyId
            }
        });
        yield db_1.default.story.update({
            where: {
                id: comment.storyId
            },
            data: {
                commentCount
            }
        });
        if (comment.parentId) {
            const replyCount = yield db_1.default.comment.count({
                where: {
                    parentId: comment.parentId
                }
            });
            yield db_1.default.comment.update({
                where: {
                    id: comment.parentId
                },
                data: {
                    replyCount
                }
            });
        }
        yield redisCache_1.cache.evictPattern(`story_comments:${comment.storyId}:*`);
        res.status(200).json({ message: "Comment deleted successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
exports.deleteComment = deleteComment;
const replycomment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const userId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
        const { content } = req.body;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }
        if (!content) {
            return res.status(400).json({ error: "Comment content is required" });
        }
        const parentComment = yield db_1.default.comment.findUnique({
            where: { id },
            include: {
                story: true
            }
        });
        if (!parentComment) {
            return res.status(404).json({ error: "Comment not found" });
        }
        if (!parentComment.story.allowComments) {
            return res.status(401).json({ error: "Story does not allow comments" });
        }
        const reply = yield db_1.default.comment.create({
            data: {
                content,
                parentId: id,
                authorId: userId,
                storyId: parentComment.storyId
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
                }
            }
        });
        const replyCount = yield db_1.default.comment.count({
            where: {
                parentId: id
            }
        });
        yield db_1.default.comment.update({
            where: { id },
            data: { replyCount }
        });
        const totalReplyCount = yield db_1.default.comment.count({
            where: {
                storyId: parentComment.storyId,
                parentId: null
            }
        });
        yield db_1.default.story.update({
            where: { id: parentComment.storyId },
            data: {
                commentCount: totalReplyCount
            }
        });
        yield redisCache_1.cache.evictPattern(`story_comments:${parentComment.storyId}:*`);
        res.status(200).json({ comment: reply });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
exports.replycomment = replycomment;
const followUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const userId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }
        if (userId === id) {
            return res.status(400).json({ error: "You cannot follow yourself" });
        }
        const userToFollow = yield db_1.default.user.findUnique({
            where: { id }
        });
        if (!userToFollow) {
            return res.status(404).json({ error: "User not found" });
        }
        const existingFollow = yield db_1.default.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: userId,
                    followingId: id
                }
            }
        });
        if (existingFollow) {
            res.status(200).json({ error: "You are already following this user" });
        }
        yield db_1.default.follow.create({
            data: {
                followerId: userId,
                followingId: id
            },
            include: {
                following: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                        isVerified: true
                    }
                }
            }
        });
        yield redisCache_1.cache.evictPattern(`user_followers:${id}:*`);
        yield redisCache_1.cache.evictPattern(`user_following:${userId}:*`);
        yield redisCache_1.cache.evict("user_follow_status", [userId, id]);
        res.status(200).json({ msg: "Followed successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
exports.followUser = followUser;
const followStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const userId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }
        const existingFollow = yield db_1.default.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: userId,
                    followingId: id
                }
            }
        });
        if (existingFollow) {
            return res.status(200).json({ following: !!existingFollow });
        }
        res.status(200).json({ following: false });
    }
    catch (error) {
    }
});
exports.followStatus = followStatus;
const unfollowUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const userId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }
        yield db_1.default.follow.delete({
            where: {
                followerId_followingId: {
                    followerId: userId,
                    followingId: id
                }
            }
        });
        yield redisCache_1.cache.evictPattern(`user_followers:${id}:*`);
        yield redisCache_1.cache.evictPattern(`user_following:${userId}:*`);
        yield redisCache_1.cache.evict("user_follow_status", [userId, id]);
        res.status(200).json({ msg: "Unfollowed successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
exports.unfollowUser = unfollowUser;
const getUserFollowers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const userId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const cachedData = yield redisCache_1.cache.get("user_followers", [id, page.toString(), limit.toString()]);
        if (cachedData) {
            return res.status(200).json(cachedData);
        }
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }
        const user = yield db_1.default.user.findUnique({
            where: { id }
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const followers = yield db_1.default.follow.findMany({
            where: {
                followingId: id
            },
            include: {
                follower: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                        isVerified: true,
                        bio: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limit
        });
        const totalFollowers = yield db_1.default.follow.count({
            where: {
                followingId: id
            }
        });
        const responseData = {
            followers,
            pagination: {
                page,
                limit,
                total: totalFollowers,
                totalPages: Math.ceil(totalFollowers / limit),
            }
        };
        yield redisCache_1.cache.set("user_followers", [id, page.toString(), limit.toString()], responseData, 600);
        res.status(200).json(responseData);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
exports.getUserFollowers = getUserFollowers;
const getUserFollowing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const userId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const cachedData = yield redisCache_1.cache.get("user_following", [id, page.toString(), limit.toString()]);
        if (cachedData) {
            return res.status(200).json(cachedData);
        }
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }
        const user = yield db_1.default.user.findUnique({
            where: { id }
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const following = yield db_1.default.follow.findMany({
            where: { followerId: id },
            include: {
                following: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                        isVerified: true,
                        bio: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limit
        });
        const totalFollowing = yield db_1.default.follow.count({
            where: { followerId: id }
        });
        const responseData = {
            following,
            pagination: {
                page,
                limit,
                total: totalFollowing,
                totalPages: Math.ceil(totalFollowing / limit),
            }
        };
        yield redisCache_1.cache.set("user_following", [id, page.toString(), limit.toString()], responseData, 600);
        res.status(200).json(responseData);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
exports.getUserFollowing = getUserFollowing;
const bookmarkStory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const userId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }
        const story = yield db_1.default.story.findUnique({
            where: { id }
        });
        if (!story) {
            return res.status(404).json({ error: "Story not found" });
        }
        const existingBookmark = yield db_1.default.bookmark.findUnique({
            where: {
                userId_storyId: {
                    userId,
                    storyId: id
                }
            }
        });
        if (existingBookmark) {
            return res.status(400).json({ error: "Story already bookmarked" });
        }
        yield db_1.default.bookmark.create({
            data: {
                userId,
                storyId: id,
            },
            include: {
                story: {
                    select: {
                        id: true,
                        title: true,
                        subtitle: true,
                        excerpt: true,
                        coverImage: true,
                        slug: true,
                        readTime: true,
                        author: {
                            select: {
                                id: true,
                                username: true,
                                name: true,
                                avatar: true,
                            }
                        }
                    }
                }
            }
        });
        const bookmarkCount = yield db_1.default.bookmark.count({
            where: {
                storyId: id
            }
        });
        yield db_1.default.story.update({
            where: { id },
            data: {
                bookmarkCount
            }
        });
        yield redisCache_1.cache.evictPattern(`user_bookmarks:${userId}:*`);
        yield redisCache_1.cache.evict("user_bookmark_status", [userId, id]);
        res.status(200).json({ msg: "Story bookmarked successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
exports.bookmarkStory = bookmarkStory;
const removeBookmark = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const userId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }
        yield db_1.default.bookmark.delete({
            where: {
                userId_storyId: {
                    userId,
                    storyId: id
                }
            }
        });
        const bookmarkCount = yield db_1.default.bookmark.count({
            where: {
                storyId: id
            }
        });
        yield db_1.default.story.update({
            where: { id },
            data: {
                bookmarkCount
            }
        });
        yield redisCache_1.cache.evictPattern(`user_bookmarks:${userId}:*`);
        yield redisCache_1.cache.evict("user_bookmark_status", [userId, id]);
        res.status(200).json({ msg: "Bookmark removed successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
exports.removeBookmark = removeBookmark;
const getUserBookmarks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const userId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const cachedData = yield redisCache_1.cache.get("user_bookmarks", [userId || 'anonymous', page.toString(), limit.toString()]);
        if (cachedData) {
            return res.status(200).json(cachedData);
        }
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }
        const bookmarks = yield db_1.default.bookmark.findMany({
            where: { userId },
            include: {
                story: {
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
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limit
        });
        const totalBookmarks = yield db_1.default.bookmark.count({
            where: { userId }
        });
        const responseData = {
            bookmarks,
            pagination: {
                page,
                limit,
                total: totalBookmarks,
                totalPages: Math.ceil(totalBookmarks / limit),
            }
        };
        yield redisCache_1.cache.set("user_bookmarks", [userId, page.toString(), limit.toString()], responseData, 900);
        res.status(200).json(responseData);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
exports.getUserBookmarks = getUserBookmarks;
const contentSearch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { q } = req.query;
        if (!q || q.trim().length === 0) {
            return res.status(400).json({ error: "Search query is required" });
        }
        const searchTerm = q.trim();
        const [stories, people, publications, topics] = yield Promise.all([
            db_1.default.story.findMany({
                where: {
                    OR: [
                        {
                            title: {
                                contains: searchTerm,
                                mode: "insensitive"
                            }
                        },
                        {
                            excerpt: {
                                contains: searchTerm,
                                mode: "insensitive"
                            }
                        },
                        {
                            content: {
                                contains: searchTerm,
                                mode: "insensitive"
                            }
                        }
                    ],
                    status: 'PUBLISHED'
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            avatar: true
                        }
                    },
                    tags: {
                        select: {
                            tag: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                },
                orderBy: [
                    { publishedAt: 'desc' },
                    { createdAt: 'desc' }
                ],
                take: 20
            }),
            db_1.default.user.findMany({
                where: {
                    OR: [
                        {
                            name: {
                                contains: searchTerm,
                                mode: "insensitive"
                            }
                        },
                        {
                            username: {
                                contains: searchTerm,
                                mode: "insensitive"
                            }
                        },
                        {
                            bio: {
                                contains: searchTerm,
                                mode: "insensitive"
                            }
                        }
                    ]
                },
                select: {
                    id: true,
                    name: true,
                    username: true,
                    avatar: true,
                    bio: true,
                    isVerified: true,
                    _count: {
                        select: {
                            followers: true
                        }
                    }
                },
                orderBy: [
                    {
                        followers: {
                            _count: 'desc'
                        }
                    },
                    { createdAt: 'desc' }
                ],
                take: 20
            }),
            db_1.default.publication.findMany({
                where: {
                    OR: [
                        {
                            name: {
                                contains: searchTerm,
                                mode: "insensitive"
                            }
                        },
                        {
                            description: {
                                contains: searchTerm,
                                mode: "insensitive"
                            }
                        }
                    ]
                },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    description: true,
                    coverImage: true,
                    _count: {
                        select: {
                            subscribers: true
                        }
                    }
                },
                orderBy: [
                    {
                        subscribers: {
                            _count: 'desc'
                        }
                    },
                    { createdAt: 'desc' }
                ],
                take: 20
            }),
            db_1.default.tag.findMany({
                where: {
                    OR: [
                        {
                            name: {
                                contains: searchTerm,
                                mode: "insensitive"
                            }
                        },
                        {
                            description: {
                                contains: searchTerm,
                                mode: "insensitive"
                            }
                        }
                    ]
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    _count: {
                        select: {
                            stories: true
                        }
                    }
                },
                orderBy: [
                    {
                        stories: {
                            _count: 'desc'
                        }
                    },
                    { createdAt: 'desc' }
                ],
                take: 20
            })
        ]);
        // Transform the data to match the expected format
        const transformedResults = {
            stories: stories.map(story => ({
                id: story.id,
                title: story.title,
                excerpt: story.excerpt,
                slug: story.slug,
                publishedAt: story.publishedAt,
                readTime: story.readTime,
                image: story.coverImage,
                author: {
                    name: story.author.name,
                    username: story.author.username,
                    avatar: story.author.avatar
                },
                tags: story.tags.map(t => t.tag.name)
            })),
            people: people.map(person => ({
                id: person.id,
                name: person.name,
                username: person.username,
                avatar: person.avatar,
                bio: person.bio,
                isVerified: person.isVerified,
                followerCount: person._count.followers
            })),
            publications: publications.map(pub => ({
                id: pub.id,
                name: pub.name,
                slug: pub.slug,
                description: pub.description,
                image: pub.coverImage,
                followerCount: pub._count.subscribers
            })),
            topics: topics.map(topic => ({
                id: topic.id,
                name: topic.name,
                description: topic.description,
                storyCount: topic._count.stories
            }))
        };
        return res.status(200).json(transformedResults);
    }
    catch (err) {
        console.error("Error while searching", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.contentSearch = contentSearch;
