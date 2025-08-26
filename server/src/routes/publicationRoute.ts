import {Router} from 'express'
import { createPublication, getPublications, getPublication, deletePublication, updatePublication, getPublicationStories, submitStoryToPublication, updateSubmissionStatus, getPublicationWriters, addPublicationWriter, removePublicationWriter, getPublicationEditors, addPublicationEditor, removePublicationEditor, getPublicationStats } from '../controller/publicationController';



const router = Router();


router.get('/', getPublications);
router.get('/:id', getPublication);
router.post('/create', createPublication);
router.delete('/delete/:id', deletePublication);
router.put('/update/:id', updatePublication);
router.get('/stories/:id', getPublicationStories);
router.post('/submit/:id', submitStoryToPublication);
router.put('/update/:id/submission/:storyId', updateSubmissionStatus);
router.get('/writers/:id', getPublicationWriters);
router.post('/writers/:id', addPublicationWriter);
router.delete('/writers/:id', removePublicationWriter);
router.get('/editors/:id', getPublicationEditors);
router.post('/editors/:id', addPublicationEditor);
router.delete('/editors/:id', removePublicationEditor);
router.get('/stats/:id', getPublicationStats);

export default router;