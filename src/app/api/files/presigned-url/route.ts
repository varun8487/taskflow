import { NextRequest, NextResponse } from 'next/server';
import { generatePresignedUploadUrl, generateFileKey } from '@/lib/s3';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { fileName, fileType, fileSize } = await req.json();

    if (!fileName || !fileType || !fileSize) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Check file size limits based on subscription tier
    // TODO: Implement subscription-based file size limits
    const maxFileSizeMB = 100; // Default to 100MB for now
    if (fileSize > maxFileSizeMB * 1024 * 1024) {
      return NextResponse.json(
        { error: `File size exceeds ${maxFileSizeMB}MB limit` },
        { status: 400 }
      );
    }

    const fileKey = generateFileKey(userId, fileName);
    const presignedUrl = await generatePresignedUploadUrl(fileKey, fileType);

    return NextResponse.json({
      presignedUrl,
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