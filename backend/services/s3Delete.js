import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from './s3.js';

export async function deleteFromS3(key) {
  if (!key) return;

  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  });

  await s3.send(command);
}
