import { Router } from "express";
import { getStoryAnalytics, getDashboardAnalytics, getPublicationAnalytics, getEarningsAnalytics } from "../controller/anlyticsController";


const router = Router();


router.get('/stories/:id', getStoryAnalytics);
router.get('/dashboard', getDashboardAnalytics);
router.get('/publications/:id', getPublicationAnalytics);
router.get('/earnings', getEarningsAnalytics);

export default router;