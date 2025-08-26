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
exports.getPublicationStats = exports.removePublicationEditor = exports.addPublicationEditor = exports.getPublicationEditors = exports.removePublicationWriter = exports.addPublicationWriter = exports.getPublicationWriters = exports.updateSubmissionStatus = exports.submitStoryToPublication = exports.getPublicationStories = exports.updatePublication = exports.deletePublication = exports.getPublication = exports.getPublications = exports.createPublication = void 0;
const publicationValidation_1 = __importDefault(require("../validators/publicationValidation"));
const db_1 = __importDefault(require("../db"));
const generateSlug_1 = require("../utils/generateSlug");
const redisCache_1 = require("../cache/redisCache"); // Import your cache
const createPublication = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { success, data } = publicationValidation_1.default.safeParse(req.body);
        if (!success) {
            return res.status(400).json({ error: "Invalid publication data" });
        }
        const slug = (0, generateSlug_1.generateSlug)(data.name);
        const publication = yield db_1.default.publication.create({
            data: Object.assign(Object.assign({}, data), { slug, ownerId: userId }),
            include: {
                owner: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true
                    }
                }
            }
        });
        yield redisCache_1.cache.evictPattern(`publications:*`);
        yield redisCache_1.cache.evictPattern(`user:${userId}:publications:*`);
        res.status(201).json({ publication });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
exports.createPublication = createPublication;
const getPublications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Accesss" });
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search;
        const cacheKey = [
            'page', page.toString(),
            'limit', limit.toString(),
            ...(search ? ['search', search] : [])
        ];
        const cachedResult = yield redisCache_1.cache.get('publications', cacheKey);
        if (cachedResult) {
            return res.status(200).json(cachedResult);
        }
        const where = {
            isPublic: true,
        };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        const publications = yield db_1.default.publication.findMany({
            where,
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
            take: limit
        });
        const totalPublications = yield db_1.default.publication.count({ where });
        const result = {
            publications,
            pagination: {
                page,
                limit,
                total: totalPublications,
                totalPages: Math.ceil(totalPublications / limit),
            }
        };
        yield redisCache_1.cache.set('publications', cacheKey, result, 600);
        res.status(200).json(result);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getPublications = getPublications;
const getPublication = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const userId = (_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Accesss" });
        }
        const cachedPublication = yield redisCache_1.cache.get('publication', [id]);
        if (cachedPublication) {
            return res.status(200).json(cachedPublication);
        }
        const publication = yield db_1.default.publication.findUnique({
            where: { id },
            include: {
                owner: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                        bio: true,
                    }
                },
                editors: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                name: true,
                                avatar: true,
                            }
                        }
                    }
                },
                writers: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                name: true,
                                avatar: true,
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        stories: true,
                        subscribers: true,
                    }
                }
            }
        });
        if (!publication) {
            return res.status(404).json({ error: "Publication not found" });
        }
        const result = { publication };
        yield redisCache_1.cache.set('publication', [id], result, 900);
        res.status(200).json(result);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getPublication = getPublication;
const deletePublication = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const userId = (_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Accesss" });
        }
        const publication = yield db_1.default.publication.findUnique({
            where: { id }
        });
        if (!publication) {
            return res.status(404).json({ error: "Publication not found" });
        }
        if (publication.ownerId !== userId) {
            return res.status(401).json({ error: "Unauthorized Accesss" });
        }
        yield db_1.default.publication.delete({
            where: { id }
        });
        yield redisCache_1.cache.evictPattern(`publication:${id}:*`);
        yield redisCache_1.cache.evictPattern(`publications:*`);
        yield redisCache_1.cache.evictPattern(`user:${userId}:publications:*`);
        yield redisCache_1.cache.evictPattern(`stories:*publication:${id}*`);
        res.status(200).json({ message: "Publication deleted successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
exports.deletePublication = deletePublication;
const updatePublication = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const userId = (_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Accesss" });
        }
        const publication = yield db_1.default.publication.findUnique({
            where: { id },
            include: {
                editors: {
                    where: { userId }
                }
            }
        });
        if (!publication) {
            return res.status(404).json({ error: "Publication not found" });
        }
        const isOwner = publication.ownerId === userId;
        const isEditor = publication.editors.length > 0;
        if (!isOwner && !isEditor) {
            return res.status(401).json({ error: "Unauthorized Accesss" });
        }
        const { success, data } = publicationValidation_1.default.safeParse(req.body);
        if (!success) {
            return res.status(400).json({ error: "Invalid publication data" });
        }
        const updatedPublication = yield db_1.default.publication.update({
            where: {
                id,
                OR: [
                    { ownerId: userId },
                    { editors: { some: { userId } } },
                ]
            },
            data: Object.assign(Object.assign({}, data), { slug: data.name ? (0, generateSlug_1.generateSlug)(data.name) : publication.slug }),
            include: {
                owner: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                    }
                }
            }
        });
        yield redisCache_1.cache.evictPattern(`publication:${id}:*`);
        yield redisCache_1.cache.evictPattern(`publications:*`);
        yield redisCache_1.cache.evictPattern(`user:${userId}:publications:*`);
        res.status(200).json({ publication: updatedPublication });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.updatePublication = updatePublication;
const getPublicationStories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const userId = (_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Accesss" });
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const cacheKey = [id, 'stories', page.toString(), limit.toString()];
        const cachedStories = yield redisCache_1.cache.get('publication', cacheKey);
        if (cachedStories) {
            return res.status(200).json(cachedStories);
        }
        const publication = yield db_1.default.publication.findUnique({
            where: { id },
        });
        if (!publication) {
            return res.status(404).json({ error: "Publication not found" });
        }
        const stories = yield db_1.default.story.findMany({
            where: {
                publicationId: id,
                status: "PUBLISHED",
                isPublic: true,
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
                        bookmarks: true,
                        comments: true,
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            },
            skip,
            take: limit
        });
        const totalStories = yield db_1.default.story.count({
            where: {
                publicationId: id,
                status: "PUBLISHED",
                isPublic: true,
            }
        });
        const result = {
            stories,
            pagination: {
                page,
                limit,
                total: totalStories,
                totalPages: Math.ceil(totalStories / limit),
            }
        };
        yield redisCache_1.cache.set('publication', cacheKey, result, 300);
        res.status(200).json(result);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getPublicationStories = getPublicationStories;
const submitStoryToPublication = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const userId = (_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId;
        const { storyId, message } = req.body;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Accesss" });
        }
        if (!storyId) {
            return res.status(400).json({ error: "Story id is required" });
        }
        const publication = yield db_1.default.publication.findUnique({
            where: { id },
        });
        if (!publication) {
            return res.status(404).json({ error: "Publication not found" });
        }
        if (!publication.allowSubmissions) {
            return res.status(401).json({ error: "Publication does not allow submissions" });
        }
        const story = yield db_1.default.story.findUnique({
            where: { id: storyId },
        });
        if (!story) {
            return res.status(404).json({ error: "Story not found" });
        }
        if (story.authorId !== userId) {
            return res.status(401).json({ error: "Unauthorized Accesss" });
        }
        const existingSubmission = yield db_1.default.storySubmission.findUnique({
            where: {
                storyId_publicationId: {
                    storyId,
                    publicationId: id,
                }
            }
        });
        if (existingSubmission) {
            return res.status(400).json({ error: "Story already submitted" });
        }
        const submission = yield db_1.default.storySubmission.create({
            data: {
                storyId,
                publicationId: id,
                submittedById: userId,
                message,
                status: "PENDING",
            },
            include: {
                story: {
                    select: {
                        id: true,
                        title: true,
                        subtitle: true,
                    }
                },
                publication: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        });
        yield redisCache_1.cache.evictPattern(`publication:${id}:submissions:*`);
        res.status(200).json({ submission });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
exports.submitStoryToPublication = submitStoryToPublication;
const updateSubmissionStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id, storyId } = req.params;
        const userId = (_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Accesss" });
        }
        const { status, response } = req.body;
        const statusArr = ["APPROVED", "REJECTED", "NEEDS_REVISION"];
        if (!statusArr.includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }
        const publication = yield db_1.default.publication.findUnique({
            where: { id },
            include: {
                editors: {
                    where: { userId }
                }
            }
        });
        if (!publication) {
            return res.status(404).json({ error: "Publication not found" });
        }
        const isOwner = publication.ownerId === userId;
        const isEditor = publication.editors.length > 0;
        if (!isOwner && !isEditor) {
            return res.status(401).json({ error: "Unauthorized Accesss" });
        }
        const submission = yield db_1.default.storySubmission.findUnique({
            where: {
                storyId_publicationId: {
                    storyId,
                    publicationId: id,
                }
            }
        });
        if (!submission) {
            return res.status(404).json({ error: "Submission not found" });
        }
        const updatedSubmission = yield db_1.default.storySubmission.update({
            where: {
                storyId_publicationId: {
                    storyId,
                    publicationId: id,
                }
            },
            data: {
                status,
                response,
                reviewedAt: new Date(),
            }
        });
        if (status === "APPROVED") {
            yield db_1.default.story.update({
                where: { id: storyId },
                data: {
                    publicationId: id,
                    submissionStatus: "APPROVED",
                }
            });
            yield redisCache_1.cache.evictPattern(`story:${storyId}:*`);
            yield redisCache_1.cache.evictPattern(`stories:*`);
            yield redisCache_1.cache.evictPattern(`publication:${id}:stories:*`);
        }
        yield redisCache_1.cache.evictPattern(`publication:${id}:submissions:*`);
        res.status(200).json({ submission: updatedSubmission });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
exports.updateSubmissionStatus = updateSubmissionStatus;
const getPublicationWriters = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const userId = (_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Accesss" });
        }
        const cachedWriters = yield redisCache_1.cache.get('publication', [id, 'writers']);
        if (cachedWriters) {
            return res.status(200).json(cachedWriters);
        }
        const publication = yield db_1.default.publication.findUnique({
            where: { id },
        });
        if (!publication) {
            return res.status(404).json({ error: "Publication not found" });
        }
        const writers = yield db_1.default.publicationWriter.findMany({
            where: {
                publicationId: id
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                        bio: true,
                        isVerified: true,
                    }
                }
            },
            orderBy: {
                addedAt: "desc"
            }
        });
        const result = { writers };
        yield redisCache_1.cache.set('publication', [id, 'writers'], result, 600);
        res.status(200).json(result);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getPublicationWriters = getPublicationWriters;
const addPublicationWriter = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const userId = (_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Accesss" });
        }
        const { writerId } = req.body;
        if (!writerId) {
            return res.status(400).json({ error: "Writer id is required" });
        }
        const existingWriter = yield db_1.default.publicationWriter.findUnique({
            where: {
                publicationId_userId: {
                    publicationId: id,
                    userId: writerId
                }
            }
        });
        if (existingWriter) {
            return res.status(400).json({ error: "Writer already added" });
        }
        const publicationWriter = yield db_1.default.publicationWriter.create({
            data: {
                publicationId: id,
                userId: writerId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                    }
                }
            }
        });
        yield redisCache_1.cache.evictPattern(`publication:${id}:writers:*`);
        yield redisCache_1.cache.evictPattern(`publication:${id}`);
        res.status(200).json({ publicationWriter });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.addPublicationWriter = addPublicationWriter;
const removePublicationWriter = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id, userId: writerId } = req.params;
        const userId = (_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Accesss" });
        }
        const publication = yield db_1.default.publication.findUnique({
            where: { id },
            include: {
                editors: {
                    where: { userId }
                }
            }
        });
        if (!publication) {
            return res.status(404).json({ error: "Publication not found" });
        }
        const isOwner = publication.ownerId === userId;
        const isEditor = publication.editors.length > 0;
        if (!isOwner && !isEditor) {
            return res.status(401).json({ error: "Unauthorized Accesss" });
        }
        const deletedWriter = yield db_1.default.publicationWriter.delete({
            where: {
                publicationId_userId: {
                    publicationId: id,
                    userId: writerId
                }
            }
        });
        yield redisCache_1.cache.evictPattern(`publication:${id}:writers:*`);
        yield redisCache_1.cache.evictPattern(`publication:${id}`);
        res.status(200).json({ message: "Writer removed successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
exports.removePublicationWriter = removePublicationWriter;
const getPublicationEditors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const userId = (_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Accesss" });
        }
        const cachedEditors = yield redisCache_1.cache.get('publication', [id, 'editors']);
        if (cachedEditors) {
            return res.status(200).json(cachedEditors);
        }
        const publication = yield db_1.default.publication.findUnique({
            where: { id },
        });
        if (!publication) {
            return res.status(404).json({ error: "Publication not found" });
        }
        const editors = yield db_1.default.publicationEditor.findMany({
            where: {
                publicationId: id
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                        bio: true,
                        isVerified: true,
                    }
                }
            },
            orderBy: {
                addedAt: "desc"
            }
        });
        const result = { editors };
        yield redisCache_1.cache.set('publication', [id, 'editors'], result, 600);
        res.status(200).json(result);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getPublicationEditors = getPublicationEditors;
const addPublicationEditor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const userId = (_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Accesss" });
        }
        const { editorId, role = "EDITOR" } = req.body;
        if (!editorId) {
            return res.status(400).json({ error: "Editor id is required" });
        }
        const publication = yield db_1.default.publication.findUnique({
            where: { id },
        });
        if (!publication) {
            return res.status(404).json({ error: "Publication not found" });
        }
        if (publication.ownerId !== userId) {
            return res.status(401).json({ error: "only Owner have Accesss" });
        }
        const editor = yield db_1.default.user.findUnique({
            where: {
                id: editorId
            }
        });
        if (!editor) {
            return res.status(404).json({ error: "Editor not found" });
        }
        const existingEditor = yield db_1.default.publicationEditor.findUnique({
            where: {
                publicationId_userId: {
                    publicationId: id,
                    userId: editorId
                }
            }
        });
        if (existingEditor) {
            return res.status(400).json({ error: "Editor already added" });
        }
        const publicationEditor = yield db_1.default.publicationEditor.create({
            data: {
                publicationId: id,
                userId: editorId,
                role,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                    }
                }
            }
        });
        yield redisCache_1.cache.evictPattern(`publication:${id}:editors:*`);
        yield redisCache_1.cache.evictPattern(`publication:${id}`);
        res.status(200).json({ publicationEditor });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
exports.addPublicationEditor = addPublicationEditor;
const removePublicationEditor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id, userId: editorId } = req.params;
        const userId = (_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Accesss" });
        }
        const publication = yield db_1.default.publication.findUnique({
            where: { id }
        });
        if (!publication) {
            return res.status(404).json({ error: "Publication not found" });
        }
        if (publication.ownerId !== userId) {
            return res.status(401).json({ error: "only Owner have Accesss" });
        }
        yield db_1.default.publicationEditor.delete({
            where: {
                publicationId_userId: {
                    publicationId: id,
                    userId: editorId
                }
            }
        });
        yield redisCache_1.cache.evictPattern(`publication:${id}:editors:*`);
        yield redisCache_1.cache.evictPattern(`publication:${id}`);
        res.status(200).json({ message: "Editor removed successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
exports.removePublicationEditor = removePublicationEditor;
const getPublicationStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const userId = (_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized Accesss" });
        }
        // Try to get from cache first
        const cachedStats = yield redisCache_1.cache.get('publication', [id, 'stats']);
        if (cachedStats) {
            return res.status(200).json(cachedStats);
        }
        const publication = yield db_1.default.publication.findUnique({
            where: { id },
            include: {
                editors: {
                    where: {
                        userId
                    }
                }
            }
        });
        if (!publication) {
            return res.status(404).json({ error: "Publication not found" });
        }
        const isOwner = publication.ownerId === userId;
        const isEditor = publication.editors.length > 0;
        if (!isOwner && !isEditor) {
            return res.status(401).json({ error: "Unauthorized Accesss" });
        }
        const storyStats = yield db_1.default.story.aggregate({
            where: {
                publicationId: id,
                status: "PUBLISHED",
            },
            _sum: {
                viewCount: true,
                clapCount: true,
                bookmarkCount: true,
                commentCount: true,
            },
            _count: {
                id: true,
            }
        });
        const subscriberCount = yield db_1.default.newsletterSubscription.count({
            where: {
                publicationId: id,
                isActive: true,
            }
        });
        const stats = {
            totalStories: storyStats._count.id,
            totalViews: storyStats._sum.viewCount || 0,
            totalClaps: storyStats._sum.clapCount || 0,
            totalBookmarks: storyStats._sum.bookmarkCount || 0,
            totalComments: storyStats._sum.commentCount || 0,
            subscribers: subscriberCount,
        };
        const result = { stats };
        yield redisCache_1.cache.set('publication', [id, 'stats'], result, 300);
        res.status(200).json(result);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getPublicationStats = getPublicationStats;
