import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generatePresignedUploadUrl, generateFileKey } from '@/lib/s3';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileName, fileType, fileSize } = await req.json();

    if (!fileName || !fileType || !fileSize) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Check file size limits (10GB for Pro, 1MB for Starter)
    const maxFileSizeMB = process.env.NODE_ENV === 'production' ? 10 * 1024 : 100; // 10GB in MB for prod, 100MB for dev
    const maxFileSizeBytes = maxFileSizeMB * 1024 * 1024;

    if (fileSize > maxFileSizeBytes) {
      return NextResponse.json(
        { error: `File size exceeds limit of ${maxFileSizeMB}MB` },
        { status: 400 }
      );
    }

    // Generate unique file key
    const fileKey = generateFileKey(userId, fileName);

    // Generate presigned upload URL
    const uploadUrl = await generatePresignedUploadUrl(fileKey, fileType);

    return NextResponse.json({
      uploadUrl,
      fileKey,
      fileName,
      fileType,
      fileSize,
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
