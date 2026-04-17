# YouTube Video Downloader MERN App

Full-stack educational MERN application that uses `yt-dlp` from an Express backend to inspect and stream YouTube downloads.

> Use this project only for content you are allowed to download. You are responsible for complying with YouTube's Terms of Service and copyright law.

## Prerequisites

- Node.js 20+
- MongoDB running locally or MongoDB Atlas URI
- `yt-dlp` installed and available on `PATH`
- `ffmpeg` installed and available on `PATH` for audio conversion / merged video formats

## Install

```bash
npm install
npm run install:all
```

## Configure Backend

Create `server/.env`:

```bash
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/youtube_downloader
CLIENT_ORIGIN=http://localhost:5173
YTDLP_PATH=yt-dlp
```

Create `client/.env` if the API URL differs:

```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

## Run Locally

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## API

- `GET /api/video-info?url=<youtube-url>`
- `GET /api/download?url=<youtube-url>&format=<formatKey>&title=<optional-title>`
- `GET /api/history`
- `DELETE /api/history`

## Notes

The backend streams `yt-dlp` stdout directly to the HTTP response. Browser download progress depends on whether the response exposes a computable content length; the UI still shows live received bytes and state transitions.
