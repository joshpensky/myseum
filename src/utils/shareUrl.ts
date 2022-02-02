import toast from 'react-hot-toast';

/**
 * Shares a URL.
 */
export const shareUrl = async (path: string) => {
  const url = window.location.origin + path;

  if ('share' in navigator) {
    await navigator.share({ url });
  } else if ('clipboard' in navigator) {
    await navigator.clipboard.writeText(url);
    toast.success('Copied link!');
  } else {
    document.execCommand('copy', false, url);
    toast.success('Copied link!');
  }
};
