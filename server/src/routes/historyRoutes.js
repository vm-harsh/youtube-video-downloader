import { Router } from 'express';
import { clearHistory, listHistory } from '../controllers/historyController.js';

const router = Router();

router.get('/', listHistory);
router.delete('/', clearHistory);

export default router;
