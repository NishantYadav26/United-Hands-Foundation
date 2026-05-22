export const optimizeCloudinaryUrl = (url, { width = 800, quality = 'auto', format = 'auto' } = {}) => {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('res.cloudinary.com') || !url.includes('/image/upload/')) return url;

  const transform = `f_${format},q_${quality},w_${width}`;
  return url.replace('/image/upload/', `/image/upload/${transform}/`);
};
