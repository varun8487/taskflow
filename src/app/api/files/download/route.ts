import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generatePresignedDownloadUrl } from '@/lib/s3';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const fileKey = searchParams.get('key');

    if (!fileKey) {
      return NextResponse.json(
        { error: 'File key is required' },
        { status: 400 }
      );
    }

    // TODO: Add additional authorization checks here
    // For example, verify that the user has access to the file
    // This would involve checking if the file belongs to a project/task the user has access to

    // Generate presigned download URL
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
