import {Router} from 'express'
import { clapStory, getStoryClaps, removeClap, storyClapStatus, addComment, getComments, updateComment, deleteComment, replycomment, clapComment, removeClapComment, followUser, followStatus, unfollowUser, getUserFollowers,getUserFollowing, bookmarkStory, removeBookmark, getUserBookmarks } from '../controller/featuresController';

const router = Router();


router.post("/story/:id/clap", clapStory);
router.delete("/story/:id/clap", removeClap);
router.get("/story/:id/claps", getStoryClaps);
router.get("/story/:id/clap-status", storyClapStatus);
router.post("/story/:id/comment", addComment);
router.get("/story/:id/comments", getComments);
router.put("/story/:id/comments/:id", updateComment);
router.delete("/story/:id/comments/:id", deleteComment);
router.post("/story/:id/comments/:id/reply", replycomment);
router.post("/story/:id/comments/:id/clap", clapComment);
router.delete("/story/:id/comments/:id/clap", removeClapComment);

router.post("/follow/:id", followUser);
router.get("/follow/:id/status", followStatus);
router.delete("/follow/:id", unfollowUser);
router.get("/followers/:id", getUserFollowers);
router.get("/following/:id", getUserFollowing);

router.post("/story/:id/bookmark", bookmarkStory);
router.delete("/story/:id/bookmark", removeBookmark);
router.get("/user/:id/bookmarks", getUserBookmarks);     

export default router;