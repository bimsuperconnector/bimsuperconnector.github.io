import { validatePhotoFile } from './validation';

/**
 * Profile photos are compressed client-side to a small square JPEG and
 * stored as a data URL directly on the `/profiles/{uid}` document.
 *
 * This is a deliberate Phase 1 decision, not an oversight: Firebase
 * Storage now requires the paid Blaze plan to provision a bucket for a
 * new project, and CLAUDE.md's cost guardrail says not to attach
 * billing without explicit owner approval, while
 * SETUP_AND_DEPLOYMENT.md / ARCHITECTURE.md both say to confirm the
 * plan supports photo storage before implementing it. A compressed
 * thumbnail (well under Firestore's 1 MiB document limit — see
 * MAX_PHOTO_DATA_URL_LENGTH and the matching cap in
 * firebase/firestore.rules) keeps photo upload zero-cost on Spark. If
 * the owner later approves Blaze and wants full-resolution photos in
 * Storage, this is the module to replace.
 */

export const PHOTO_TARGET_SIZE = 256;
export const PHOTO_JPEG_QUALITY = 0.72;
/** Keep comfortably under Firestore's ~1 MiB document limit; enforced
 * again server-side in firebase/firestore.rules. */
export const MAX_PHOTO_DATA_URL_LENGTH = 200_000;

/** Pure — returns the source rectangle for a centered square ("cover") crop. */
export function computeCoverCrop(
  width: number,
  height: number,
): { sx: number; sy: number; size: number } {
  const size = Math.min(width, height);
  return {
    sx: (width - size) / 2,
    sy: (height - size) / 2,
    size,
  };
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error('That image appears to be broken or unsupported.'));
    image.src = dataUrl;
  });
}

/**
 * Validates, then compresses and center-crops an uploaded photo to a
 * small square JPEG data URL suitable for storing directly in the
 * profile document.
 */
export async function compressPhotoFile(file: File): Promise<string> {
  const validationError = validatePhotoFile(file);
  if (validationError) throw new Error(validationError);

  const sourceDataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(sourceDataUrl);

  const { sx, sy, size } = computeCoverCrop(
    image.naturalWidth,
    image.naturalHeight,
  );

  const canvas = document.createElement('canvas');
  canvas.width = PHOTO_TARGET_SIZE;
  canvas.height = PHOTO_TARGET_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not process that image on this device.');

  ctx.drawImage(
    image,
    sx,
    sy,
    size,
    size,
    0,
    0,
    PHOTO_TARGET_SIZE,
    PHOTO_TARGET_SIZE,
  );

  const result = canvas.toDataURL('image/jpeg', PHOTO_JPEG_QUALITY);
  if (result.length > MAX_PHOTO_DATA_URL_LENGTH) {
    throw new Error(
      'That photo could not be compressed small enough. Please try a simpler image.',
    );
  }
  return result;
}
