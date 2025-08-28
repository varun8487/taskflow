"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Upload, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle,
  Lock,
  Crown
} from 'lucide-react';
import { useSubscription, getFeatureLimits } from '@/lib/subscription';
import { getFileTypeIcon, formatFileSize } from '@/lib/s3';
import { useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import Link from 'next/link';

interface FileUploadProps {
  taskId?: string;
  projectId?: string;
  onUploadComplete?: (file: any) => void;
  maxFiles?: number;
  disabled?: boolean;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  fileKey?: string;
}

export default function FileUpload({ 
  taskId, 
  projectId, 
  onUploadComplete, 
  maxFiles = 10,
  disabled = false 
}: FileUploadProps) {
  const { isPro, tier } = useSubscription();
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const createFile = useMutation(api.files?.createFile); // Optional chaining in case files API isn't implemented yet

  const limits = getFeatureLimits(tier);
  const maxFileSize = limits.maxFileUploadMB * 1024 * 1024; // Convert MB to bytes

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!isPro) {
      return; // This component should only be rendered for Pro users
    }

    const filesToUpload = acceptedFiles.slice(0, maxFiles);
    
    // Initialize uploading state
    const initialFiles: UploadingFile[] = filesToUpload.map(file => ({
      file,
      progress: 0,
      status: 'uploading',
    }));
    
    setUploadingFiles(prev => [...prev, ...initialFiles]);

    // Upload each file
    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      const fileIndex = uploadingFiles.length + i;

      try {
        // Check file size
        if (file.size > maxFileSize) {
          throw new Error(`File size exceeds ${limits.maxFileUploadMB}MB limit`);
        }

        // Get presigned upload URL
        const response = await fetch('/api/files/presigned-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get upload URL');
        }

        const { uploadUrl, fileKey } = await response.json();

        // Upload file to S3
        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file');
        }

        // Update progress to 100%
        setUploadingFiles(prev => 
          prev.map((f, idx) => 
            idx === fileIndex 
              ? { ...f, progress: 100, status: 'success', fileKey }
              : f
          )
        );

        // Save file record to database (if API exists)
        if (createFile) {
          try {
            await createFile({
              name: file.name,
              url: `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${fileKey}`,
              size: file.size,
              type: file.type,
              taskId: taskId as any,
              projectId: projectId as any,
              uploaderId: 'current-user', // This should be the actual user ID
              s3Key: fileKey,
            });
          } catch (dbError) {
            console.error('Failed to save file record:', dbError);
          }
        }

        if (onUploadComplete) {
          onUploadComplete({
            name: file.name,
            size: file.size,
            type: file.type,
            key: fileKey,
            url: uploadUrl,
          });
        }

      } catch (error) {
        console.error('Upload error:', error);
        setUploadingFiles(prev => 
          prev.map((f, idx) => 
            idx === fileIndex 
              ? { 
                  ...f, 
                  status: 'error', 
                  error: error instanceof Error ? error.message : 'Upload failed' 
                }
              : f
          )
        );
      }
    }
  }, [isPro, maxFiles, maxFileSize, limits.maxFileUploadMB, taskId, projectId, onUploadComplete, createFile, uploadingFiles.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: disabled || !isPro,
    multiple: maxFiles > 1,
    maxFiles,
  });

  const removeFile = (index: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index));
  };

  if (!isPro) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <Lock className="w-12 h-12 text-amber-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-amber-800 mb-2">File Uploads - Pro Feature</h3>
            <p className="text-amber-700 mb-4">
              Upgrade to Pro to upload and share files with your team.
            </p>
            <Link href="/billing">
              <Button size="sm">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card 
        {...getRootProps()} 
        className={`border-2 border-dashed cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <CardContent className="flex flex-col items-center justify-center p-6">
          <input {...getInputProps()} />
          <Upload className={`w-8 h-8 mb-4 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          <div className="text-center">
            <p className="text-lg font-medium mb-1">
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or click to select files
            </p>
            <Badge variant="secondary" className="text-xs">
              Max {formatFileSize(maxFileSize)} per file
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploading Files</h4>
          {uploadingFiles.map((uploadingFile, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">
                  {getFileTypeIcon(uploadingFile.file.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {uploadingFile.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(uploadingFile.file.size)}
                  </p>
                  {uploadingFile.status === 'uploading' && (
                    <Progress value={uploadingFile.progress} className="mt-1" />
                  )}
                  {uploadingFile.status === 'error' && (
                    <p className="text-xs text-red-500 mt-1">
                      {uploadingFile.error}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {uploadingFile.status === 'success' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {uploadingFile.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => removeFile(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
