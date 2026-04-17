import { spawn } from 'child_process';
import DownloadHistory from '../models/DownloadHistory.js';
import { createHttpError } from '../utils/createHttpError.js';
import { sanitizeFilename } from '../utils/sanitizeFilename.js';

const YTDLP_PATH = process.env.YTDLP_PATH || 'yt-dlp';

const FORMAT_OPTIONS = {
  '360p': {
    label: '360p',
    selector: 'bestvideo[height<=360]+bestaudio/best[height<=360]/best',
    extension: 'mp4',
    contentType: 'video/mp4'
  },
  '480p': {
    label: '480p',
    selector: 'bestvideo[height<=480]+bestaudio/best[height<=480]/best',
    extension: 'mp4',
    contentType: 'video/mp4'
  },
  '720p': {
    label: '720p',
    selector: 'bestvideo[height<=720]+bestaudio/best[height<=720]/best',
    extension: 'mp4',
    contentType: 'video/mp4'
  },
  '1080p': {
    label: '1080p',
    selector: 'bestvideo[height<=1080]+bestaudio/best[height<=1080]/best',
    extension: 'mp4',
    contentType: 'video/mp4'
  },
  audio: {
    label: 'Audio MP3',
    selector: 'bestaudio/best',
    extension: 'mp3',
    contentType: 'audio/mpeg',
    audioOnly: true
  }
};

export function getFormatOptions() {
  return Object.entries(FORMAT_OPTIONS).map(([key, value]) => ({
    key,
    label: value.label,
    extension: value.extension,
    audioOnly: Boolean(value.audioOnly)
  }));
}

export async function getVideoInfo(url) {
  const json = await runYtDlpJson(['--dump-json', '--no-playlist', url]);
  const formats = getFormatOptions().map((option) => ({
    ...option,
    size: estimateFormatSize(json.formats, option.key)
  }));

  return {
    id: json.id,
    title: json.title,
    thumbnail: json.thumbnail,
    duration: json.duration,
    webpageUrl: json.webpage_url || url,
    formats
  };
}

export async function streamDownload({ url, formatKey, title, res }) {
  const option = FORMAT_OPTIONS[formatKey];

  if (!option) {
    throw createHttpError(400, 'Unsupported format selected.');
  }

  const safeTitle = sanitizeFilename(title || 'youtube-download');
  const filename = `${safeTitle}.${option.extension}`;
  const args = [
    '--no-playlist',
    '--newline',
    '-f',
    option.selector,
    '-o',
    '-'
  ];

  if (option.audioOnly) {
    args.unshift('--audio-format', 'mp3');
    args.unshift('-x');
  } else {
    args.unshift('--merge-output-format', 'mp4');
  }

  args.push(url);

  res.setHeader('Content-Type', option.contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('X-Download-Title', encodeURIComponent(safeTitle));

  const child = spawn(YTDLP_PATH, args, {
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let bytesSent = 0;
  let stderr = '';

  child.stdout.on('data', (chunk) => {
    bytesSent += chunk.length;
  });

  child.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
    const progress = parseProgressLine(chunk.toString());
    if (progress) {
      console.log(`yt-dlp ${formatKey}: ${progress.percent ?? '?'} ${progress.speed ?? ''}`);
    }
  });

  child.on('error', (error) => {
    if (!res.headersSent) {
      res.status(500).json({ message: 'yt-dlp failed to start. Confirm it is installed on PATH.' });
    } else {
      res.destroy(error);
    }
  });

  child.stdout.pipe(res);

  child.on('close', async (code) => {
    if (code === 0) {
      await DownloadHistory.create({
        title: safeTitle,
        format: option.label,
        size: bytesSent,
        sourceUrl: url
      });
      return;
    }

    console.error(stderr);
    if (!res.headersSent) {
      res.status(500).json({ message: 'yt-dlp could not download this media.' });
    } else {
      res.end();
    }
  });

  res.on('close', () => {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  });
}

function runYtDlpJson(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(YTDLP_PATH, args, {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', () => {
      reject(createHttpError(500, 'yt-dlp is not available. Install yt-dlp and confirm it is on PATH.'));
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(createHttpError(422, readableYtDlpError(stderr)));
        return;
      }

      try {
        resolve(JSON.parse(stdout));
      } catch {
        reject(createHttpError(500, 'yt-dlp returned an unreadable response.'));
      }
    });
  });
}

function estimateFormatSize(formats = [], key) {
  if (key === 'audio') {
    const audio = formats
      .filter((format) => format.acodec !== 'none')
      .sort((a, b) => (b.filesize || b.filesize_approx || 0) - (a.filesize || a.filesize_approx || 0))[0];
    return audio?.filesize || audio?.filesize_approx || null;
  }

  const height = Number.parseInt(key, 10);
  const candidates = formats.filter((format) => format.height && format.height <= height);
  const best = candidates.sort((a, b) => (b.height || 0) - (a.height || 0))[0];
  return best?.filesize || best?.filesize_approx || null;
}

function parseProgressLine(line) {
  const percent = line.match(/(\d+(?:\.\d+)?)%/);
  const speed = line.match(/at\s+([^\s]+)/);
  return percent || speed
    ? {
        percent: percent?.[1],
        speed: speed?.[1]
      }
    : null;
}

function readableYtDlpError(stderr) {
  if (!stderr) {
    return 'Unable to fetch video information.';
  }

  if (stderr.includes('Unsupported URL')) {
    return 'This URL is not supported.';
  }

  if (stderr.includes('Video unavailable')) {
    return 'This video is unavailable.';
  }

  return stderr.split('\n').filter(Boolean).slice(-1)[0] || 'yt-dlp failed.';
}
