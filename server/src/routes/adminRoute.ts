import { Router } from "express";
import { getCurrentAdmin ,getAdminUsers, updateUserStatus, deleteUserAccount, getAdminStories, moderateStory, removeStory, getAdminPublications, moderatePublication, getAdminReports, resolveReport, getAdminAnalytics, getSystemHealth, getAdminDashboard, getUserActivityLogs, bulkActionStories, validateStoryModeration, validateUserUpdate, validatePublicationUpdate, getAdvancedAnalytics } from "../controller/adminController";



const router = Router();




router.get('/me', ...getCurrentAdmin);
router.get('/dashboard', ...getAdminDashboard);
router.get('/users', ...getAdminUsers); 
router.put('/users/:id/status', [...validateUserUpdate, ...updateUserStatus]);
router.delete('/users/:id', ...deleteUserAccount);
router.get('/users/:id/activity-logs', ...getUserActivityLogs);

router.get('/stories', ...getAdminStories);
router.put('/stories/:id/status', [...validateStoryModeration, ...moderateStory]);
router.delete('/stories/:id', ...removeStory);
router.post('/stories/bulk-action', ...bulkActionStories);

router.get('/publications', ...getAdminPublications);   
router.put('/publications/:id/status', [...validatePublicationUpdate, ...moderatePublication]);

router.get('/reports', getAdminReports);
router.put('/reports/:id/resolve', ...resolveReport);

router.get('/analytics', ...getAdminAnalytics);
router.get('/analytics/advance', ...getAdvancedAnalytics);
router.get('/system-health', ...getSystemHealth);




export default router;