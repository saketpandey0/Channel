import {Router} from 'express'
import { createStory, deleteStory, getStories, getStory, updateStory, getFeed, getTrendingStories, publishStory, unpublishStory, getUserDrafts, getStoryVersions, getUserPublishedStories, getStoriesStats  } from '../controller/storiesController';




const router = Router();


router.post('/create', createStory);
router.get('/getstories', getStories);
router.get('/getstory/:id', getStory);
router.delete('/delete/:id', deleteStory);
router.put('/update/story/:id', updateStory);
router.get('/getfeed', getFeed);
router.get('/trending/stories', getTrendingStories);
router.post('/publish/:id', publishStory);
router.post('/unpublish/:id', unpublishStory);
router.get('/drafts', getUserDrafts);
router.get('/published', getUserPublishedStories);
router.get('/stats/:id', getStoriesStats);
router.get('/versions/:id', getStoryVersions);
router.get('/version/:versionId', getStory);

export default router;