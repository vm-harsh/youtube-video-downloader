export function formatDuration(seconds) {
  if (!seconds) {
    return 'Unknown duration';
  }

  const date = new Date(seconds * 1000);
  const hours = Math.floor(seconds / 3600);
  return hours > 0 ? date.toISOString().slice(11, 19) : date.toISOString().slice(14, 19);
}

export function formatBytes(bytes) {
  if (!bytes) {
    return 'Size varies';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}
