/**
 * S3 helper using AWS SDK v3.
 * Expects AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET in env.
 * Uploads buffers (from multer memoryStorage) and returns public URL.
 */
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { randomUUID } = require('crypto');

const bucket = process.env.AWS_S3_BUCKET;
const region = process.env.AWS_REGION || 'us-east-1';

if (!bucket) {
  console.warn('AWS_S3_BUCKET not set - S3 uploads will fail if used.');
}

// Initialize S3 client
const s3Client = new S3Client({
  region: region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

/**
 * Upload a buffer to S3 and return the public URL
 * @param {Buffer} buffer - File buffer from multer
 * @param {string} originalName - Original filename
 * @param {string} mimeType - MIME type (e.g., 'image/jpeg', 'application/pdf')
 * @param {string} folder - Folder prefix (default: 'uploads')
 * @returns {Promise<string>} - Public URL of uploaded file
 */
async function uploadBuffer(buffer, originalName, mimeType, folder = 'uploads') {
  if (!bucket) {
    throw new Error('S3 bucket not configured (AWS_S3_BUCKET)');
  }
  
  // Sanitize filename and create unique key
  const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = `${folder}/${Date.now()}-${randomUUID()}-${sanitizedName}`;
  
  const params = {
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: mimeType
  };
  
  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    
    // Construct public URL
    const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    return publicUrl;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Failed to upload file to S3');
  }
}

/**
 * Upload multiple files to S3
 * @param {Array} files - Array of file objects with {buffer, originalName, mimeType}
 * @param {string} folder - Folder prefix
 * @returns {Promise<Array<string>>} - Array of public URLs
 */
async function uploadMultiple(files, folder = 'uploads') {
  const uploadPromises = files.map(file => 
    uploadBuffer(file.buffer, file.originalName, file.mimeType, folder)
  );
  return Promise.all(uploadPromises);
}

module.exports = { 
  uploadBuffer,
  uploadMultiple,
  s3Client 
};