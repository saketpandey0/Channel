import { Router } from "express";
import { uploadImage, uploadVideo, getMedia, getRelatedStories, reportStory } from "../controller/contentController";

const router = Router();



router.post('/upload/:id/image', uploadImage);
router.post('/upload/:id/video', uploadVideo);
router.get('/media/:id', getMedia);
router.get('/stories/related/:id', getRelatedStories);
router.post('/stories/:id/report', reportStory);


export default router;  