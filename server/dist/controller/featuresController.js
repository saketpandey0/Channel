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
exports.getBatchStoryMetaData = exports.contentSearch = exports.populateFollowCounts = exports.toggleStoryBookmark = exports.getBatchFollowData = exports.getUserFollowData = exports.toggleUserFollow = exports.replycomment = exports.deleteComment = exports.updateComment = exports.getBatchCommentClapData = exports.toggleCommentClap = exports.getComments = exports.addComment = exports.getStoryClapData = exports.toggleClapStory = void 0;
const db_1 = __importDefault(require("../db"));
const commentValidation_1 = __importDefault(require("../validators/commentValidation"));
const redisCache_1 = require("../cache/redisCache");
const toggleClapStory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const userId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }
        const story = yield db_1.default.story.findUnique({
            where: { id },
            select: { allowClaps: true, clapCount: true }
        });
        if (!story) {
            return res.status(404).json({ error: "Story not found" });
        }
        if (!story.allowClaps) {
            return res.status(403).json({ error: "Story does not allow claps" });
        }
        const existingClap = yield db_1.default.clap.findUnique({
            where: {
                userId_storyId: {
                    userId,
                    storyId: id
                }
            }
        });
        let newClapStatus;
        let newClapCount;
        if (existingClap) {
            yield db_1.default.clap.delete({
                where: {
                    userId_storyId: {
                        userId,
                        storyId: id
                    }
                }
            });
            newClapStatus = false;
            newClapCount = Math.max((story.clapCount || 0) - 1, 0);
        }
        else {
            yield db_1.default.clap.create({
                data: {
                    userId,
                    storyId: id,
                    count: 1,
                }
            });
            newClapStatus = true;
            newClapCount = (story.clapCount || 0) + 1;
        }
        yield db_1.default.story.update({
            where: { id },
            data: { clapCount: newClapCount }
        });
        const cacheKeys = [
            `clap:status:${userId}:${id}`,
            `story:claps:${id}`,
            `story:${id}`
        ];
        yield Promise.all(cacheKeys.map(key => redisCache_1.cache.evictPattern(key)));
        return res.status(200).json({
            clapped: newClapStatus,
            clapCount: newClapCount,
            message: newClapStatus ? "Story clapped successfully" : "Clap removed successfully"
        });
    }
    catch (error) {
        console.error('Toggle clap error:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.toggleClapStory = toggleClapStory;
const getStoryClapData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const userId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }
        const cacheKey = `story:claps:${id}`;
        const cachedData = yield redisCache_1.cache.get(cacheKey, [userId ? userId : '']);
        if (cachedData) {
            return res.status(200).json(JSON.parse(cachedData));
        }
        const story = yield db_1.default.story.findUnique({
            where: { id },
            select: {
                allowClaps: true,
                clapCount: true,
                id: true
            }
        });
        if (!story) {
            return res.status(404).json({ error: "Story not found" });
        }
        if (!story.allowClaps) {
            return res.status(403).json({ error: "Story does not allow claps" });
        }
        // Get user's clap status if authenticated
        let userClapped = false;
        if (userId) {
            const userClap = yield db_1.default.clap.findUnique({
                where: {
                    userId_storyId: {
                        userId,
                        storyId: id
                    }
                }
            });
            userClapped = !!userClap;
        }
        const responseData = {
            clapCount: story.clapCount || 0,
            userClapped,
            allowClaps: story.allowClaps
        };
        yield redisCache_1.cache.set(cacheKey, [JSON.stringify(responseData)], 300);
        return res.status(200).json(responseData);
    }
    catch (error) {
        console.error('Get clap data error:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.getStoryClapData = getStoryClapData;
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
const toggleCommentClap = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        let newClapStatus;
        let newClapCount;
        if (existingClap) {
            yield db_1.default.clapComment.delete({
                where: {
                    userId_commentId: {
                        userId,
                        commentId: id
                    }
                }
            });
            newClapStatus = false;
            newClapCount = Math.max((comment.clapCount || 0) - 1, 0);
        }
        else {
            yield db_1.default.clapComment.create({
                data: {
                    userId,
                    commentId: id,
                    count: 1
                }
            });
            newClapStatus = true;
            newClapCount = (comment.clapCount || 0) + 1;
        }
        yield db_1.default.comment.update({
            where: { id },
            data: { clapCount: newClapCount }
        });
        const cacheKeys = [
            `clap:status:${userId}:${id}`,
            `comment:claps:${id}`,
            `comment:${id}`
        ];
        yield Promise.all(cacheKeys.map(key => redisCache_1.cache.evictPattern(key)));
        return res.status(200).json({
            clapped: newClapStatus,
            clapCount: newClapCount,
            message: newClapStatus ? "Comment clapped successfully" : "Clap removed successfully"
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
});
exports.toggleCommentClap = toggleCommentClap;
const getBatchCommentClapData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { commentIds } = req.body;
        const userId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }
        if (!Array.isArray(commentIds) || commentIds.length === 0) {
            return res.status(400).json({ error: "Invalid comment ids" });
        }
        const comments = yield db_1.default.comment.findMany({
            where: { id: { in: commentIds } },
            select: { id: true, clapCount: true }
        });
        const userClaps = yield db_1.default.clapComment.findMany({
            where: {
                userId,
                commentId: { in: commentIds }
            },
            select: { commentId: true }
        });
        const userClapSet = new Set(userClaps.map(c => c.commentId));
        const response = comments.reduce((acc, c) => {
            acc[c.id] = {
                clapCount: c.clapCount || 0,
                userClap: userClapSet.has(c.id)
            };
            return acc;
        }, {});
        return res.status(200).json(response);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
});
exports.getBatchCommentClapData = getBatchCommentClapData;
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
const toggleUserFollow = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const { id } = req.params;
        const userId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
        console.log("userId", userId, id);
        console.log("toogleUserFollow", (_d = req.session) === null || _d === void 0 ? void 0 : _d.user);
        console.log("toogleUserFollow 2", req.user);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }
        if (userId === id) {
            return res.status(401).json({ error: "You cannot follow yourself" });
        }
        const existingFollow = yield db_1.default.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: userId,
                    followingId: id,
                },
            },
        });
        let newFollowStatus;
        let updatedCounts;
        if (existingFollow) {
            // unfollow
            yield db_1.default.follow.delete({
                where: {
                    followerId_followingId: {
                        followerId: userId,
                        followingId: id,
                    },
                },
            });
            updatedCounts = yield Promise.all([
                db_1.default.user.update({
                    where: { id: userId },
                    data: { followingCount: { decrement: 1 } },
                    select: { followingCount: true },
                }),
                db_1.default.user.update({
                    where: { id },
                    data: { followersCount: { decrement: 1 } },
                    select: { followersCount: true },
                }),
            ]);
            newFollowStatus = false;
        }
        else {
            yield db_1.default.follow.create({
                data: {
                    followerId: userId,
                    followingId: id,
                },
            });
            updatedCounts = yield Promise.all([
                db_1.default.user.update({
                    where: { id: userId },
                    data: { followingCount: { increment: 1 } },
                    select: { followingCount: true },
                }),
                db_1.default.user.update({
                    where: { id },
                    data: { followersCount: { increment: 1 } },
                    select: { followersCount: true },
                }),
            ]);
            newFollowStatus = true;
        }
        const cacheKey = [
            `follow:status:${userId}:${id}`,
            `follow:data:${id}`,
            `user:followers:${id}`,
            `user:following:${userId}`,
            `user:${id}`,
            `user:${userId}`,
        ];
        yield Promise.all(cacheKey.map((key) => redisCache_1.cache.evictPattern(key)));
        return res.status(200).json({
            following: newFollowStatus,
            followerCount: updatedCounts[1].followersCount,
            followingCount: updatedCounts[0].followingCount,
            msg: newFollowStatus ? "Followed successfully" : "Unfollowed successfully",
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
exports.toggleUserFollow = toggleUserFollow;
const getUserFollowData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        console.log("calling getUserFollowData");
        const { id } = req.params;
        const userId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Accesss" });
        }
        const cacheKey = `follow:data:${id}:${userId}`;
        const cachedData = yield redisCache_1.cache.get(cacheKey, []);
        if (cachedData) {
            return res.status(200).json(cachedData);
        }
        const user = yield db_1.default.user.findUnique({
            where: { id },
            select: { id: true }
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const [followersCount, followingCount] = yield Promise.all([
            db_1.default.follow.count({
                where: { followingId: id }
            }),
            db_1.default.follow.count({
                where: { followerId: id }
            })
        ]);
        let isFollowing = false;
        if (userId && userId !== id) {
            const followRelation = yield db_1.default.follow.findUnique({
                where: {
                    followerId_followingId: {
                        followerId: userId,
                        followingId: id
                    }
                }
            });
            isFollowing = !!followRelation;
        }
        const responseData = {
            followersCount,
            followingCount,
            isFollowing,
            canFollow: !!userId && userId !== id
        };
        yield redisCache_1.cache.set(cacheKey, [JSON.stringify(responseData)], 300);
        console.log("responseData", responseData);
        return res.status(200).json(responseData);
    }
    catch (error) {
        console.error('Get follow data error:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.getUserFollowData = getUserFollowData;
const getBatchFollowData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { userIds } = req.body;
        const currentUserId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ error: "Invalid user IDs" });
        }
        if (userIds.length > 50) {
            return res.status(400).json({ error: "Too many user IDs (max 50)" });
        }
        const users = yield db_1.default.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true }
        });
        const existingUserIds = users.map(u => u.id);
        const followersData = yield db_1.default.follow.groupBy({
            by: ['followingId'],
            where: {
                followingId: { in: existingUserIds }
            },
            _count: {
                followingId: true
            }
        });
        const followingData = yield db_1.default.follow.groupBy({
            by: ['followerId'],
            where: {
                followerId: { in: existingUserIds }
            },
            _count: {
                followerId: true
            }
        });
        let followingRelations = {};
        if (currentUserId) {
            const follows = yield db_1.default.follow.findMany({
                where: {
                    followerId: currentUserId,
                    followingId: { in: existingUserIds }
                },
                select: { followingId: true }
            });
            followingRelations = follows.reduce((acc, follow) => {
                acc[follow.followingId] = true;
                return acc;
            }, {});
        }
        const followersMap = followersData.reduce((acc, item) => {
            acc[item.followingId] = item._count.followingId;
            return acc;
        }, {});
        const followingMap = followingData.reduce((acc, item) => {
            acc[item.followerId] = item._count.followerId;
            return acc;
        }, {});
        const responseData = existingUserIds.reduce((acc, userId) => {
            acc[userId] = {
                followersCount: followersMap[userId] || 0,
                followingCount: followingMap[userId] || 0,
                isFollowing: followingRelations[userId] || false,
                canFollow: currentUserId && currentUserId !== userId
            };
            return acc;
        }, {});
        return res.status(200).json(responseData);
    }
    catch (error) {
        console.error('Batch follow data error:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.getBatchFollowData = getBatchFollowData;
const toggleStoryBookmark = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const userId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }
        const story = yield db_1.default.story.findUnique({
            where: { id },
            select: { id: true }
        });
        if (!story) {
            return res.status(404).json({ error: "Story not found" });
        }
        const existingBookmark = yield db_1.default.bookmark.findUnique({
            where: { userId_storyId: { userId, storyId: id } }
        });
        let newBookmarkStatus;
        if (existingBookmark) {
            yield db_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
                yield tx.bookmark.delete({
                    where: { userId_storyId: { userId, storyId: id } }
                });
                yield Promise.all([
                    tx.story.update({
                        where: { id },
                        data: { bookmarkCount: { decrement: 1 } }
                    }),
                    tx.user.update({
                        where: { id: userId },
                        data: { bookmarkCount: { decrement: 1 } }
                    })
                ]);
            }));
            newBookmarkStatus = false;
        }
        else {
            yield db_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
                yield tx.bookmark.create({
                    data: { userId, storyId: id }
                });
                yield Promise.all([
                    tx.story.update({
                        where: { id },
                        data: { bookmarkCount: { increment: 1 } }
                    }),
                    tx.user.update({
                        where: { id: userId },
                        data: { bookmarkCount: { increment: 1 } }
                    })
                ]);
            }));
            newBookmarkStatus = true;
        }
        const [updatedStory, updatedUser] = yield Promise.all([
            db_1.default.story.findUnique({
                where: { id },
                select: { bookmarkCount: true }
            }),
            db_1.default.user.findUnique({
                where: { id: userId },
                select: { bookmarkCount: true }
            })
        ]);
        const cacheKeys = [
            `bookmark:status:${userId}:${id}`,
            `bookmark:data:${id}`,
            `story:bookmarks:${id}`,
            `user:bookmarks:${userId}`,
            `story:${id}`,
            `user:${userId}`
        ];
        yield Promise.all(cacheKeys.map(key => redisCache_1.cache.evictPattern(key)));
        return res.status(200).json({
            bookmarked: newBookmarkStatus,
            storyBookmarkCount: (updatedStory === null || updatedStory === void 0 ? void 0 : updatedStory.bookmarkCount) || 0,
            userBookmarkCount: (updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.bookmarkCount) || 0,
            message: newBookmarkStatus
                ? "Story bookmarked successfully"
                : "Bookmark removed successfully"
        });
    }
    catch (error) {
        console.error("Toggle bookmark error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.toggleStoryBookmark = toggleStoryBookmark;
const populateFollowCounts = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield db_1.default.user.findMany({
            select: { id: true }
        });
        for (const user of users) {
            const [followersCount, followingCount] = yield Promise.all([
                db_1.default.follow.count({
                    where: { followingId: user.id }
                }),
                db_1.default.follow.count({
                    where: { followerId: user.id }
                })
            ]);
            yield db_1.default.user.update({
                where: { id: user.id },
                data: {
                    followersCount,
                    followingCount
                }
            });
        }
        console.log('Follow counts populated successfully');
    }
    catch (error) {
        console.error('Error populating follow counts:', error);
    }
});
exports.populateFollowCounts = populateFollowCounts;
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
const getBatchStoryMetaData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { ids } = req.body;
        const userId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: "Invalid story ids" });
        }
        if (ids.length > 50) {
            return res.status(400).json({ error: "Too many story ids" });
        }
        const storyIds = [...new Set(ids)];
        const stories = yield db_1.default.story.findMany({
            where: {
                id: { in: storyIds },
            },
            select: {
                id: true,
                clapCount: true,
                allowClaps: true,
            }
        });
        const claps = yield db_1.default.clap.findMany({
            where: {
                userId,
                storyId: { in: storyIds }
            },
            select: { storyId: true }
        });
        const userClaps = claps.reduce((acc, clap) => {
            acc[clap.storyId] = true;
            return acc;
        }, {});
        const bookmarks = yield db_1.default.bookmark.findMany({
            where: {
                userId,
                storyId: { in: storyIds }
            },
            select: { storyId: true }
        });
        const userBookmarks = bookmarks.reduce((acc, bm) => {
            acc[bm.storyId] = true;
            return acc;
        }, {});
        const response = stories.reduce((acc, story) => {
            acc[story.id] = {
                clapCount: story.clapCount || 0,
                userClapped: userClaps[story.id] || false,
                allowClaps: story.allowClaps,
                bookmarked: userBookmarks[story.id] || false
            };
            return acc;
        }, {});
        return res.status(200).json(response);
    }
    catch (err) {
        console.error('Batch story metadata error:', err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.getBatchStoryMetaData = getBatchStoryMetaData;
