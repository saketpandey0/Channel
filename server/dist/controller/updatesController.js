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
exports.unsubscribeFromPublication = exports.subscribeToPublication = exports.getPublicationSubscribers = exports.sendNewsletter = exports.deleteNotification = exports.markAllNotificationsRead = exports.markNotificationRead = exports.getUserNotifications = void 0;
const db_1 = __importDefault(require("../db"));
const redisCache_1 = require("../cache/redisCache");
const transporter_1 = require("../utils/transporter");
// GET /api/notifications - Get user notifications
const getUserNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.session.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const unreadOnly = req.query.unread === 'true';
        const where = { userId };
        if (unreadOnly)
            where.isRead = false;
        let notifications;
        if (page === 1 && !unreadOnly) {
            const cacheArgs = [userId, page.toString(), limit.toString()];
            const cachedNotifications = yield redisCache_1.cache.get('notifications', cacheArgs);
            if (cachedNotifications) {
                notifications = JSON.parse(cachedNotifications);
            }
        }
        if (!notifications) {
            notifications = yield db_1.default.notification.findMany({
                where,
                include: {
                    story: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            });
            if (page === 1 && !unreadOnly) {
                const cacheArgs = [userId, page.toString(), limit.toString()];
                yield redisCache_1.cache.set('notifications', cacheArgs, notifications, 300);
            }
        }
        const totalNotifications = yield db_1.default.notification.count({ where });
        const unreadCount = yield db_1.default.notification.count({
            where: { userId, isRead: false }
        });
        res.status(200).json({
            notifications,
            unreadCount,
            pagination: {
                page,
                limit,
                total: totalNotifications,
                totalPages: Math.ceil(totalNotifications / limit),
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getUserNotifications = getUserNotifications;
// PUT /api/notifications/:id/read - Mark as read
const markNotificationRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.session.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        const notification = yield db_1.default.notification.findUnique({
            where: { id }
        });
        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }
        if (notification.userId !== userId) {
            return res.status(403).json({ error: "Access denied" });
        }
        const updatedNotification = yield db_1.default.notification.update({
            where: { id },
            data: { isRead: true },
        });
        yield redisCache_1.cache.evictPattern(`notifications:${userId}:*`);
        res.status(200).json({ notification: updatedNotification });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.markNotificationRead = markNotificationRead;
// PUT /api/notifications/mark-all-read - Mark all as read
const markAllNotificationsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.session.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        yield db_1.default.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
        yield redisCache_1.cache.evictPattern(`notifications:${userId}:*`);
        res.status(200).json({ message: "All notifications marked as read" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.markAllNotificationsRead = markAllNotificationsRead;
// DELETE /api/notifications/:id - Delete notification
const deleteNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.session.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        const notification = yield db_1.default.notification.findUnique({
            where: { id }
        });
        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }
        if (notification.userId !== userId) {
            return res.status(403).json({ error: "Access denied" });
        }
        yield db_1.default.notification.delete({
            where: { id }
        });
        yield redisCache_1.cache.evictPattern(`notifications:${userId}:*`);
        res.status(200).json({ message: "Notification deleted successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.deleteNotification = deleteNotification;
// POST /api/publications/:id/newsletter - Send newsletter
const sendNewsletter = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.session.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { subject, content, storyIds } = req.body;
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
        if (!publication.hasNewsletter) {
            return res.status(400).json({ error: "Newsletter is not enabled for this publication" });
        }
        const subscribers = yield db_1.default.newsletterSubscription.findMany({
            where: {
                publicationId: id,
                isActive: true,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    }
                }
            }
        });
        yield db_1.default.notification.createMany({
            data: subscribers.map(sub => ({
                userId: sub.userId,
                type: "NEWSLETTER_SENT",
                title: `Newsletter: ${subject}`,
                message: `New newsletter from ${publication.name}`,
                data: { publicationId: id, subject, storyIds },
            })),
        });
        yield Promise.all(subscribers.map(sub => redisCache_1.cache.evictPattern(`notifications:${sub.userId}:*`)));
        const emailPromises = subscribers.map(sub => transporter_1.transporter.sendMail({
            from: `"${publication.name}" <${process.env.EMAIL_USERNAME}>`,
            to: sub.user.email,
            subject,
            html: `<h2>${subject}</h2><p>${content}</p>`,
        }));
        yield Promise.all(emailPromises);
        res.status(200).json({
            message: "Newsletter sent successfully",
            subscriberCount: subscribers.length,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.sendNewsletter = sendNewsletter;
// GET /api/publications/:id/subscribers - Newsletter subscribers
const getPublicationSubscribers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const subscribers = yield db_1.default.newsletterSubscription.findMany({
            where: {
                publicationId: id,
                isActive: true,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                        email: isOwner,
                    }
                }
            },
            orderBy: { subscribedAt: 'desc' },
        });
        const subscriberCount = subscribers.length;
        res.status(200).json({
            subscribers,
            count: subscriberCount,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getPublicationSubscribers = getPublicationSubscribers;
// POST /api/publications/:id/subscribe - Subscribe to publication
const subscribeToPublication = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.session.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        const publication = yield db_1.default.publication.findUnique({
            where: { id }
        });
        if (!publication) {
            return res.status(404).json({ error: "Publication not found" });
        }
        if (!publication.hasNewsletter) {
            return res.status(400).json({ error: "This publication doesn't have a newsletter" });
        }
        const existingSubscription = yield db_1.default.newsletterSubscription.findUnique({
            where: {
                userId_publicationId: {
                    userId,
                    publicationId: id,
                }
            }
        });
        if (existingSubscription) {
            if (existingSubscription.isActive) {
                return res.status(400).json({ error: "Already subscribed to this publication" });
            }
            else {
                // Reactivate subscription
                const subscription = yield db_1.default.newsletterSubscription.update({
                    where: {
                        userId_publicationId: {
                            userId,
                            publicationId: id,
                        }
                    },
                    data: {
                        isActive: true,
                        subscribedAt: new Date(),
                        unsubscribedAt: null,
                    }
                });
                return res.status(200).json({ subscription });
            }
        }
        const subscription = yield db_1.default.newsletterSubscription.create({
            data: {
                userId,
                publicationId: id,
                isActive: true,
            }
        });
        res.status(201).json({ subscription });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.subscribeToPublication = subscribeToPublication;
// DELETE /api/publications/:id/subscribe - Unsubscribe
const unsubscribeFromPublication = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.session.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        const subscription = yield db_1.default.newsletterSubscription.findUnique({
            where: {
                userId_publicationId: {
                    userId,
                    publicationId: id,
                }
            }
        });
        if (!subscription || !subscription.isActive) {
            return res.status(404).json({ error: "Subscription not found" });
        }
        yield db_1.default.newsletterSubscription.update({
            where: {
                userId_publicationId: {
                    userId,
                    publicationId: id,
                }
            },
            data: {
                isActive: false,
                unsubscribedAt: new Date(),
            }
        });
        res.status(200).json({ message: "Unsubscribed successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.unsubscribeFromPublication = unsubscribeFromPublication;
