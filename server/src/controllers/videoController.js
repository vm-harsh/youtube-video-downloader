import { getVideoInfo, streamDownload } from '../services/ytdlpService.js';
import { createHttpError } from '../utils/createHttpError.js';
import { isValidYouTubeUrl } from '../utils/validators.js';

export async function fetchVideoInfo(req, res, next) {
  try {
    const { url } = req.query;

    if (!isValidYouTubeUrl(url)) {
      throw createHttpError(400, 'Enter a valid YouTube video URL.');
    }

    const info = await getVideoInfo(url);
    res.json(info);
  } catch (error) {
    next(error);
  }
}

export async function downloadVideo(req, res, next) {
  try {
    const { url, format, title } = req.method === 'POST' ? req.body : req.query;

    if (!isValidYouTubeUrl(url)) {
      throw createHttpError(400, 'Enter a valid YouTube video URL.');
    }

    if (!format) {
      throw createHttpError(400, 'Choose a format before downloading.');
    }

    await streamDownload({ url, formatKey: format, title, res });
  } catch (error) {
    if (!res.headersSent) {
      next(error);
    } else {
      res.end();
    }
  }
}
