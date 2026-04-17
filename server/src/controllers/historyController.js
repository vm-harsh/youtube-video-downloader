import DownloadHistory from '../models/DownloadHistory.js';

export async function listHistory(_req, res, next) {
  try {
    const items = await DownloadHistory.find().sort({ date: -1 }).limit(30).lean();
    res.json(items);
  } catch (error) {
    next(error);
  }
}

export async function clearHistory(_req, res, next) {
  try {
    await DownloadHistory.deleteMany({});
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
