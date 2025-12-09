/**
 * S3 helper using AWS SDK v2.
 * Expects AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET in env.
 * Uploads buffers (from multer memoryStorage) and returns public URL.
 */
const AWS = require('aws-sdk');
const uuid = require('crypto').randomUUID;

const bucket = process.env.AWS_S3_BUCKET;
if (!bucket) console.warn('AWS_S3_BUCKET not set - S3 uploads will fail if used.');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

async function uploadBuffer(buffer, originalName, mimeType) {
  if (!bucket) throw new Error('S3 bucket not configured (AWS_S3_BUCKET)');
  const key = `images/${Date.now()}-${uuid()}-${originalName}`.replace(/\s+/g,'-');
  const params = {
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
    ACL: 'public-read'
  };
  const res = await s3.upload(params).promise();
  return res.Location; // public URL
}

module.exports = { uploadBuffer };
