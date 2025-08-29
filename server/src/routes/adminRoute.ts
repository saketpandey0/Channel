import { Router } from "express";
import { getAdminUsers, updateUserStatus, deleteUserAccount, getAdminStories, moderateStory, removeStory, getAdminPublications, moderatePublication, getAdminReports, resolveReport, getAdminAnalytics, getSystemHealth, getAdminDashboard, getUserActivityLogs, bulkActionStories } from "../controller/adminController";



const router = Router();



router.get('/users', ...getAdminUsers); 
router.put('/users/:id/status', ...updateUserStatus);
router.delete('/users/:id', ...deleteUserAccount);

router.get('/stories', ...getAdminStories);
router.put('/stories/:id/status', ...moderateStory);
router.delete('/stories/:id', ...removeStory);

router.get('/publications', ...getAdminPublications);   
router.put('/publications/:id/status', ...moderatePublication);

router.get('/reports', getAdminReports);
router.put('/reports/:id/resolve', ...resolveReport);

router.get('/analytics', ...getAdminAnalytics);
router.get('/system-health', ...getSystemHealth);
router.get('/dashboard', ...getAdminDashboard);
router.get('/users/:id/activity-logs', ...getUserActivityLogs);
router.post('/stories/bulk-action', ...bulkActionStories);

export default router;