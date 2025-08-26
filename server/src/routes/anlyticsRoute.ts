    import { Router } from "express";
import { getStoryAnalytics, getDashboardAnalytics, getPublicationAnalytics, getEarningsAnalytics } from "../controller/anlyticsController";


const router = Router();


router.get('/story/:id', getStoryAnalytics);
router.get('/dashboard', getDashboardAnalytics);
router.get('/publication/:id', getPublicationAnalytics);
router.get('/earnings', getEarningsAnalytics);

export default router;