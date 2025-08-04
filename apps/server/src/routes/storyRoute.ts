import {Router} from 'express'
import { createStory, deleteStory, getStories, getStory, updateStory } from '../controller/storiesController';




const router = Router();


router.post('/create', createStory);
router.get('/getstories', getStories);
router.get('/getstory/:id', getStory);
router.get('/delete/:id', deleteStory);
router.get('/updatestory/:id', updateStory);



export default router;