import { Router } from "express";
import adminRoute from "./adminRoute";
import userRoute from "./userRoute";
import storyRoute from "./storyRoute";
import publicationRoute from "./publicationRoute";
import updatesRoute from "./updatesRoute";
import featuresRoute from "./featuresRoute";
import anlyticsRoute from "./anlyticsRoute";
import contentRoute from "./contentRoute";

const router = Router();

router.use("/auth", userRoute);
router.use("/story", storyRoute);
router.use("/publications", publicationRoute);
router.use("/admin", adminRoute);
router.use("/", updatesRoute);
router.use("/analytics", anlyticsRoute);    
router.use("/features", featuresRoute);
router.use("/", contentRoute);

export default router;