import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const STORAGE_BUCKET = 'groupdocs-files';
export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
  : null;

const safeFileName = (name = 'document') => name.replace(/[^a-zA-Z0-9._-]/g, '_');

const getStoragePathFromPublicUrl = (fileUrl) => {
  try {
    const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
    const path = new URL(fileUrl).pathname;
    const markerIndex = path.indexOf(marker);

    if (markerIndex === -1) return null;

    return decodeURIComponent(path.slice(markerIndex + marker.length));
  } catch {
    return null;
  }
};

export async function uploadDocumentFile(file) {
  if (!supabase) throw new Error('Thiếu cấu hình Supabase. Hãy kiểm tra file .env.');
  const path = `uploads/${Date.now()}-${safeFileName(file.name)}`;
  let content;
  if (Platform.OS === 'web' && file.file) content = file.file;
  else {
    const response = await fetch(file.uri);
    content = await response.arrayBuffer();
  }
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, content, {
    contentType: file.mimeType || 'application/octet-stream',
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteDocumentFile(fileUrl) {
  if (!supabase) throw new Error('Thiếu cấu hình Supabase. Hãy kiểm tra file .env.');

  const path = getStoragePathFromPublicUrl(fileUrl);
  if (!path) return { deleted: false };

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([path]);

  if (error) throw error;

  return { deleted: true };
}
