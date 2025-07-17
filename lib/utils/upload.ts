import { NextApiRequest } from 'next';
import formidable from 'formidable';
import { mkdir, stat } from 'fs/promises';
import { join } from 'path';

export const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

/**
 * Configure formidable for parsing multipart form data
 * This enables file uploads with additional fields
 */
export const formidableConfig = {
  keepExtensions: true,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  uploadDir: UPLOAD_DIR,
  filter: (part: formidable.Part): boolean => {
    return part.mimetype === 'image/png' || part.mimetype === 'image/svg+xml';
  }
};

/**
 * Parse multipart form data, including file uploads
 * Returns parsed fields and files
 */
export const parseForm = async (
  req: NextApiRequest
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  // Ensure upload directory exists
  try {
    await stat(UPLOAD_DIR);
  } catch (e) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    const form = formidable(formidableConfig);

    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
};
