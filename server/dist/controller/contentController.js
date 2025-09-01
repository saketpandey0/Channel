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
exports.reportStory = exports.getRelatedStories = exports.getMedia = exports.uploadVideo = exports.uploadImage = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const promises_1 = __importDefault(require("fs/promises"));
const db_1 = __importDefault(require("../db"));
const redisCache_1 = require("../cache/redisCache");
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = file.mimetype.startsWith('image/') ? 'uploads/images/' : 'uploads/videos/';
        (0, fs_1.mkdirSync)(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 200 * 1024 * 1024, // 200MB limit
    },
    fileFilter: (req, file, cb) => {
        console.log("uploading file", file.mimetype);
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type'), false);
        }
    }
});
exports.uploadImage = [
    upload.single('image'),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            console.log("start upload");
            const { id } = req.params;
            const userId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
            if (!userId) {
                return res.status(401).json({ error: "Unauthorized Access" });
            }
            if (!req.file) {
                return res.status(400).json({ error: "No file uploaded" });
            }
            console.log("upploading");
            const media = yield db_1.default.media.create({
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
            const storyMedia = yield db_1.default.storyMedia.create({
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
        }
        catch (error) {
            console.error("Error uploading image:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    })
];
exports.uploadVideo = [
    upload.single('video'),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            const { id } = req.params;
            const userId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
            if (!userId) {
                return res.status(401).json({ error: "Unauthorized Access" });
            }
            if (!req.file) {
                return res.status(400).json({ error: "No file uploaded" });
            }
            const media = yield db_1.default.media.create({
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
            const storyMedia = yield db_1.default.storyMedia.create({
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
        }
        catch (error) {
            console.error("Error uploading video:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    })
];
const getMedia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const cacheKey = `media`;
        const cachedMedia = yield redisCache_1.cache.get(cacheKey, [id]);
        let media;
        if (cachedMedia) {
            media = JSON.parse(cachedMedia);
        }
        else {
            media = yield db_1.default.media.findUnique({
                where: { id }
            });
            if (!media) {
                return res.status(404).json({ error: "Media not found" });
            }
            yield redisCache_1.cache.set(cacheKey, [id], media, 86400);
        }
        const filePath = path_1.default.resolve(media.path);
        try {
            yield promises_1.default.access(filePath);
        }
        catch (err) {
            return res.status(404).json({ error: "Media not found" });
        }
        res.setHeader('Content-Type', media.mimeType);
        res.setHeader('Content-Length', media.size);
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        res.sendFile(media);
    }
    catch (error) {
        console.error("Error getting media:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getMedia = getMedia;
const getRelatedStories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const limit = parseInt(req.query.limit) || 5;
        const cacheKeyArgs = [id, limit.toString()];
        const cachedRelated = yield redisCache_1.cache.get("relatedStories", cacheKeyArgs);
        if (cachedRelated) {
            return res.status(200).json({ stories: cachedRelated });
        }
        if (cachedRelated) {
            return res.status(200).json({ stories: JSON.parse(cachedRelated) });
        }
        const story = yield db_1.default.story.findUnique({
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
        const relatedStories = yield db_1.default.story.findMany({
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
        yield redisCache_1.cache.set("relatedStories", cacheKeyArgs, relatedStories, 3600);
        res.status(200).json({ stories: relatedStories });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getRelatedStories = getRelatedStories;
const reportStory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const userId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
        const { reason, description } = req.body;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Access" });
        }
        if (!reason) {
            return res.status(400).json({ error: "Reason is required" });
        }
        const story = yield db_1.default.story.findUnique({
            where: { id }
        });
        if (!story) {
            return res.status(404).json({ error: "Story not found" });
        }
        const existingReport = yield db_1.default.report.findFirst({
            where: {
                storyId: story.id,
                reportedById: userId,
            }
        });
        if (existingReport) {
            return res.status(400).json({ error: "You have already reported this story" });
        }
        yield db_1.default.report.create({
            data: {
                reportedById: userId,
                storyId: story.id,
                reason,
                description,
                status: 'PENDING',
            }
        });
        res.status(201).json({ message: "Report submitted successfully" });
    }
    catch (error) {
        console.error("Error reporting story:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.reportStory = reportStory;
