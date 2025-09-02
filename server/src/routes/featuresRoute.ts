import {Router} from 'express'
import { toggleClapStory, getStoryClapData, getBatchStoryMetaData, addComment, getComments, updateComment, deleteComment, replycomment, toggleCommentClap, getBatchCommentClapData, toggleUserFollow, getUserFollowData, getBatchFollowData, toggleStoryBookmark, contentSearch, getUserBookmarks, getStoryBookmarks } from '../controller/featuresController';
import { authenticate } from '../middlewares/middleware';

const router = Router();

router.use(authenticate);


router.post("/story/:id/clap", toggleClapStory);
router.get("/story/:id/clap", getStoryClapData);
router.post("/story/metadata", getBatchStoryMetaData);
router.post("/story/:id/comment", addComment);
router.get("/story/:id/comments", getComments);
router.put("/story/comments/:id", updateComment);
router.delete("/story/comments/:id", deleteComment);
router.post("/story/comments/:id/reply", replycomment);
router.post("/story/comment/:id/clap", toggleCommentClap);
router.post("/story/:id/comment/clap", getBatchCommentClapData);

router.post("/user/:id/follow", toggleUserFollow);
router.get("/user/:id/follow", getUserFollowData);
router.post("/user/follows", getBatchFollowData);

router.post("/story/:id/bookmark", toggleStoryBookmark);
router.get("/user/bookmarks", getUserBookmarks);
router.get("/story/:id/bookmarks", getStoryBookmarks);

router.get("/search", contentSearch);

export default router;