"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const updatesController_1 = require("../controller/updatesController");
const router = (0, express_1.Router)();
router.get('/notifications', updatesController_1.getUserNotifications);
router.put('/notifications/:id/read', updatesController_1.markNotificationRead);
router.put('/notifications/mark-all-read', updatesController_1.markAllNotificationsRead);
router.delete('/notifications/:id', updatesController_1.deleteNotification);
// Newsletter
router.post('/publications/:id/newsletter', updatesController_1.sendNewsletter);
router.get('/publications/:id/subscribers', updatesController_1.getPublicationSubscribers);
router.post('/publications/:id/subscribe', updatesController_1.subscribeToPublication);
router.delete('/publications/:id/subscribe', updatesController_1.unsubscribeFromPublication);
exports.default = router;
