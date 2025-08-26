import { Router } from "express";
import { getUserNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification, sendNewsletter, getPublicationSubscribers, subscribeToPublication, unsubscribeFromPublication } from "../controller/updatesController";

const router = Router();


router.get('/notifications', getUserNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.put('/notifications/mark-all-read', markAllNotificationsRead);
router.delete('/notifications/:id', deleteNotification);

// Newsletter
router.post('/publications/:id/newsletter', sendNewsletter);
router.get('/publications/:id/subscribers', getPublicationSubscribers);
router.post('/publications/:id/subscribe', subscribeToPublication);
router.delete('/publications/:id/subscribe', unsubscribeFromPublication);

export default router;