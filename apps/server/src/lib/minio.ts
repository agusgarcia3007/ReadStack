import * as Minio from 'minio';

// MinIO client configuration for Railway deployment
export const minioClient = new Minio.Client({
  endPoint: Bun.env.MINIO_ENDPOINT!, // Your Railway MinIO endpoint (without http://)
  port: parseInt(Bun.env.MINIO_PORT || '9000'),
  useSSL: Bun.env.MINIO_USE_SSL === 'true',
  accessKey: Bun.env.MINIO_ACCESS_KEY!,
  secretKey: Bun.env.MINIO_SECRET_KEY!,
});

export const BOOKS_BUCKET = 'book-covers';

// Initialize bucket on startup
export async function initializeBucket() {
  try {
    const exists = await minioClient.bucketExists(BOOKS_BUCKET);
    if (!exists) {
      await minioClient.makeBucket(BOOKS_BUCKET, 'us-east-1');
      console.log(`✅ Created bucket: ${BOOKS_BUCKET}`);
    } else {
      console.log(`✅ Bucket exists: ${BOOKS_BUCKET}`);
    }
  } catch (error) {
    console.error('❌ Error initializing MinIO bucket:', error);
  }
}

// Upload file to MinIO
export async function uploadFile(
  buffer: Buffer,
  fileName: string,
  contentType: string,
  metadata?: Record<string, string>
): Promise<string> {
  try {
    const objectName = `${Date.now()}-${fileName}`;
    
    await minioClient.putObject(
      BOOKS_BUCKET,
      objectName,
      buffer,
      buffer.length,
      {
        'Content-Type': contentType,
        ...metadata,
      }
    );

    // Generate public URL (adjust based on your MinIO setup)
    const publicUrl = `${Bun.env.MINIO_PUBLIC_URL}/${BOOKS_BUCKET}/${objectName}`;
    return publicUrl;
  } catch (error) {
    console.error('❌ Error uploading file to MinIO:', error);
    throw new Error('Failed to upload file');
  }
}

// Delete file from MinIO
export async function deleteFile(objectName: string): Promise<void> {
  try {
    await minioClient.removeObject(BOOKS_BUCKET, objectName);
  } catch (error) {
    console.error('❌ Error deleting file from MinIO:', error);
    throw new Error('Failed to delete file');
  }
}