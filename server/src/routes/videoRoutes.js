import { Router } from 'express';
import { downloadVideo, fetchVideoInfo } from '../controllers/videoController.js';

const router = Router();

router.get('/video-info', fetchVideoInfo);
router.get('/download', downloadVideo);
router.post('/download', downloadVideo);

export default router;
