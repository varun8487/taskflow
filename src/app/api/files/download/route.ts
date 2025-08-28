import { NextRequest, NextResponse } from 'next/server';
import { generatePresignedDownloadUrl } from '@/lib/s3';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const fileKey = searchParams.get('key');

    if (!fileKey) {
      return NextResponse.json(
        { error: 'File key is required' },
        { status: 400 }
      );
    }

    // TODO: Verify user has access to this file
    // Check if file belongs to user or if user has access via team/project

    const downloadUrl = await generatePresignedDownloadUrl(fileKey);

    return NextResponse.json({
      downloadUrl,
    });
  } catch (error) {
    console.error('Error generating download URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}