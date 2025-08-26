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
router.use((req, res, next) => {
  console.log("Session ID:", req.sessionID);
  console.log("Session Data:", req.session);
  console.log("Passport User:", req.user);
  next();
});

router.use("/auth", userRoute);
router.use("/story", storyRoute);
router.use("/publication", publicationRoute);
router.use("/admin", adminRoute);
router.use("/", updatesRoute);
router.use("/analytics", anlyticsRoute);    
router.use("/feature", featuresRoute);
router.use("/", contentRoute);

export default router;