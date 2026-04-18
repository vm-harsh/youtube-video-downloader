import { spawn } from 'child_process';
import { createReadStream } from 'fs';
import { mkdtemp, readdir, rm, stat } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { pipeline } from 'stream/promises';
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
    size: estimateFormatSize(json.formats, option.key, json.duration)
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
  const tempDir = await mkdtemp(join(tmpdir(), 'youtube-download-'));
  const outputTemplate = join(tempDir, 'download.%(ext)s');
  const args = [
    '--no-playlist',
    '--newline',
    '-f',
    option.selector,
    '-o',
    outputTemplate
  ];

  if (option.audioOnly) {
    args.unshift('--audio-format', 'mp3');
    args.unshift('-x');
  } else {
    args.unshift('--merge-output-format', 'mp4');
  }

  args.push(url);

  let child;
  let cleanedUp = false;
  const abortDownload = () => {
    if (child && !child.killed) {
      child.kill('SIGTERM');
    }
  };

  try {
    child = spawn(YTDLP_PATH, args, {
      stdio: ['ignore', 'ignore', 'pipe']
    });
    res.once('close', abortDownload);

    await waitForYtDlp(child, formatKey);
    res.off('close', abortDownload);

    const outputPath = await findDownloadedFile(tempDir, option.extension);
    const { size } = await stat(outputPath);

    res.setHeader('Content-Type', option.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', size);
    res.setHeader('X-Download-Title', encodeURIComponent(safeTitle));

    await pipeFileToResponse(outputPath, res);
    await saveDownloadHistory({
      title: safeTitle,
      format: option.label,
      size,
      sourceUrl: url
    });
    await cleanupTempDir(tempDir);
    cleanedUp = true;
  } catch (error) {
    res.off('close', abortDownload);

    if (child && !child.killed) {
      child.kill('SIGTERM');
    }

    if (!res.headersSent) {
      throw error;
    }

    res.destroy(error);
  } finally {
    if (!cleanedUp) {
      await cleanupTempDir(tempDir);
    }
  }
}

function waitForYtDlp(child, formatKey) {
  return new Promise((resolve, reject) => {
    let stderr = '';

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
      const progress = parseProgressLine(chunk.toString());
      if (progress) {
        console.log(`yt-dlp ${formatKey}: ${progress.percent ?? '?'} ${progress.speed ?? ''}`);
      }
    });

    child.on('error', () => {
      reject(createHttpError(500, 'yt-dlp failed to start. Confirm it is installed on PATH.'));
    });

    child.on('close', (code) => {
      if (code !== 0) {
        console.error(stderr);
        reject(createHttpError(500, readableYtDlpError(stderr) || 'yt-dlp could not download this media.'));
        return;
      }

      resolve(stderr);
    });
  });
}

async function findDownloadedFile(tempDir, extension) {
  const files = await readdir(tempDir);
  const preferred = files.find((file) => file.toLowerCase().endsWith(`.${extension}`));
  const file = preferred || files[0];

  if (!file) {
    throw createHttpError(500, 'yt-dlp did not create a downloadable file.');
  }

  return join(tempDir, file);
}

function pipeFileToResponse(filePath, res) {
  return pipeline(createReadStream(filePath), res);
}

async function saveDownloadHistory(entry) {
  try {
    await DownloadHistory.create(entry);
  } catch (error) {
    console.error('Failed to save download history', error);
  }
}

async function cleanupTempDir(tempDir) {
  await rm(tempDir, { recursive: true, force: true });
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

function estimateFormatSize(formats = [], key, duration) {
  if (key === 'audio') {
    return getFormatSizeBytes(findBestAudioFormat(formats), duration);
  }

  const height = Number.parseInt(key, 10);
  const video = findBestVideoFormat(formats, height);
  const audio = video?.acodec === 'none' ? findBestAudioFormat(formats) : null;
  const videoSize = getFormatSizeBytes(video, duration);
  const audioSize = getFormatSizeBytes(audio, duration);

  return videoSize || audioSize ? (videoSize || 0) + (audioSize || 0) : null;
}

function findBestAudioFormat(formats = []) {
  return formats
    .filter((format) => format.acodec !== 'none' && format.vcodec === 'none')
    .sort(compareFormatQuality)[0]
    || formats
      .filter((format) => format.acodec !== 'none')
      .sort(compareFormatQuality)[0];
}

function findBestVideoFormat(formats = [], height) {
  return formats
    .filter((format) => format.height && format.height <= height)
    .sort(compareFormatQuality)[0];
}

function compareFormatQuality(a, b) {
  return (b.height || 0) - (a.height || 0)
    || getFormatBitrate(b) - getFormatBitrate(a)
    || getKnownFormatSize(b) - getKnownFormatSize(a);
}

function getKnownFormatSize(format) {
  return format?.filesize || format?.filesize_approx || 0;
}

function getFormatBitrate(format) {
  return format?.tbr || format?.vbr || format?.abr || 0;
}

function getFormatSizeBytes(format, duration) {
  const knownSize = getKnownFormatSize(format);

  if (knownSize) {
    return knownSize;
  }

  const bitrateKbps = getFormatBitrate(format);
  if (!bitrateKbps || !duration) {
    return null;
  }

  return Math.round((bitrateKbps * 1000 * duration) / 8);
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
