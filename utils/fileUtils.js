import dotenv from 'dotenv';
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';

dotenv.config();

// AWS S3 클라이언트 설정(v3)
export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

// S3 이미지 삭제
export const deleteImageFromS3 = async (imageKey) => {
  if (!imageKey) return;
  try {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: imageKey,
    });
    
    await s3Client.send(deleteCommand);

  } catch(error){
    console.error('[deleteImageFromS3 Error]', error);
  }
}
