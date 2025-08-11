import {Router} from 'express'
import { clapStory, getStoryClaps, removeClap, addComment, getComments, updateComment, deleteComment, replycomment, followUser, unfollowUser, getUserFollowers,getUserFollowing, bookmarkStory, removeBookmark, getUserBookmarks } from '../controller/featuresController';

const router = Router();


router.post("/claps/:id", clapStory);
router.get("/stories/:id/claps", getStoryClaps);
router.delete("/stories/:id/claps", removeClap);
router.post("/stories/:id/comment", addComment);
router.get("/stories/:id/comments", getComments);
router.put("/stories/:id/comments/:id", updateComment);
router.delete("/stories/:id/comments/:id", deleteComment);
router.post("/stories/:id/comments/:id/reply", replycomment);

router.post("/follow/:id", followUser);
router.delete("/follow/:id", unfollowUser);
router.get("/followers/:id", getUserFollowers);
router.get("/following/:id", getUserFollowing);

router.post("/stories/:id/bookmark", bookmarkStory);
router.delete("/stories/:id/bookmark", removeBookmark);
router.get("/stories/:id/bookmarks", getUserBookmarks);     

export default router;