export const getYouTubeEmbedUrl = (url: string): string | null => {
  const regExp =
    /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[1].length === 11
    ? `https://www.youtube.com/embed/${match[1]}`
    : null;
};
