import { decode } from 'base64-arraybuffer';
import * as uuid from 'uuid';
import { supabase } from '@src/data/supabase';
import { SupabaseBucket } from './getImageUrl';

/**
 * Uploads a base64-encoded file to Supabase.
 *
 * @param bucket the bucket to upload to
 * @param base64Data the base64 image data (e.g., 'type:<contentType>;base64,<data>')
 *
 * @returns the filename
 */
export const uploadSupabaseFile = async (bucket: SupabaseBucket, base64Data: string) => {
  const fileContentType = base64Data.slice(0, base64Data.indexOf(';')).replace('data:', '');
  const fileBase64Data = base64Data.replace(`data:${fileContentType};base64,`, '');
  const fileExtension = fileContentType.replace('image/', '');

  const fileName = `${uuid.v4()}.${fileExtension}`;
  const upload = await supabase.storage.from(bucket).upload(fileName, decode(fileBase64Data), {
    contentType: fileContentType,
  });

  if (!upload.data || upload.error) {
    throw upload.error ?? new Error(`Unable to upload to bucket ${bucket}.`);
  }

  return fileName;
};
