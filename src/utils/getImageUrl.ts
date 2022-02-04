import { supabase } from '@src/data/supabase';

type SupabaseBucket = 'headshots' | 'frames' | 'artworks';

export const getImageUrl = (bucket: SupabaseBucket, src: string) => {
  const download = supabase.storage.from(bucket).getPublicUrl(src);
  if (!download.data || download.error) {
    throw download.error ?? new Error('Cannot access image.');
  }
  return download.data.publicURL;
};
