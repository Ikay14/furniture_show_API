/**
 * Extracts the public ID from a Cloudinary URL.
 * @param url - The Cloudinary URL.
 * @returns string - The public ID.
 */

export function extractCloudinaryPublicId(url: string): string {
  // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/file.jpg
  const matches = url.match(/upload\/(?:v\d+\/)?(.+?)\.\w+$/);

  if (!matches || matches.length < 2) {
    throw new Error('Invalid Cloudinary URL');
  }

  return matches[1]; // Returns the public ID (e.g., "folder/file")
}