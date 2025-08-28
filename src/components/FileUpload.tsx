"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle,
  Cloud,
  Loader2
} from "lucide-react";
import { formatFileSize, getFileTypeIcon } from "@/lib/s3";
import { FeatureGate } from "./FeatureGate";

interface FileUploadProps {
  projectId?: string;
  taskId?: string;
  onUploadComplete?: (file: { id: string; name: string; size: number; type: string; url: string }) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedFileTypes?: string[];
  className?: string;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  fileKey?: string;
  url?: string;
}

export function FileUpload({
  projectId,
  taskId, 
  onUploadComplete, 
  maxFiles = 10,
  maxSizeMB = 100,
  acceptedFileTypes = ['image/*', 'application/pdf', '.doc,.docx,.txt'],
  className = ''
}: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);

  const createFile = useMutation(api.files.createFile);

  const uploadToS3 = async (file: File, presignedUrl: string): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
  };

  const handleFileUpload = useCallback(async (files: File[]) => {
    const newUploadingFiles: UploadingFile[] = files.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const,
    }));
    
    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileIndex = uploadingFiles.length + i;

      try {
        // Update progress - getting presigned URL
        setUploadingFiles(prev => 
          prev.map((f, idx) => 
            idx === fileIndex ? { ...f, progress: 10 } : f
          )
        );

        // Get presigned URL
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

        const { presignedUrl, fileKey } = await response.json();

        // Update progress - starting upload
        setUploadingFiles(prev => 
          prev.map((f, idx) => 
            idx === fileIndex ? { ...f, progress: 25, fileKey } : f
          )
        );

        // Upload to S3
        await uploadToS3(file, presignedUrl);

        // Update progress - creating database record
        setUploadingFiles(prev => 
          prev.map((f, idx) => 
            idx === fileIndex ? { ...f, progress: 75 } : f
          )
        );

        // Create file record in database
        const fileId = await createFile({
          name: file.name,
          url: `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${fileKey}`,
          size: file.size,
          type: file.type,
          s3Key: fileKey,
          taskId: taskId as Id<"tasks"> | undefined,
          projectId: projectId as Id<"projects"> | undefined,
        });

        // Complete upload
        setUploadingFiles(prev => 
          prev.map((f, idx) => 
            idx === fileIndex 
              ? { 
                  ...f, 
                  progress: 100, 
                  status: 'success',
                  url: `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${fileKey}`
                } 
              : f
          )
        );

        // Call completion callback
        if (onUploadComplete) {
          onUploadComplete({
            id: fileId,
            name: file.name,
            size: file.size,
            type: file.type,
            url: `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${fileKey}`,
          });
        }

      } catch (error) {
        console.error('Upload error:', error);
        setUploadingFiles(prev => 
          prev.map((f, idx) => 
            idx === fileIndex 
              ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
              : f
          )
        );
      }
    }
  }, [projectId, taskId, createFile, onUploadComplete, uploadingFiles.length]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length + uploadingFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const oversizedFiles = acceptedFiles.filter(file => file.size > maxSizeMB * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert(`Files must be smaller than ${maxSizeMB}MB`);
      return;
    }

    handleFileUpload(acceptedFiles);
    setIsDragActive(false);
  }, [uploadingFiles.length, maxFiles, maxSizeMB, handleFileUpload]);

  const { getRootProps, getInputProps, isDragActive: dropzoneActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  const removeFile = (index: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearCompleted = () => {
    setUploadingFiles(prev => prev.filter(f => f.status === 'uploading'));
  };

    return (
    <FeatureGate feature="maxFileUploadMB" fallback={
      <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
        <CardContent className="p-8 text-center">
          <Cloud className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            File Upload Requires Upgrade
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Upload files and attachments with a Pro subscription
          </p>
        </CardContent>
      </Card>
    }>
      <div className={`space-y-4 ${className}`}>
        {/* Dropzone */}
      <Card 
        {...getRootProps()} 
          className={`border-dashed border-2 transition-all duration-200 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 ${
            isDragActive || dropzoneActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50'
          }`}
        >
          <CardContent className="p-8 text-center">
          <input {...getInputProps()} />
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: isDragActive || dropzoneActive ? 1.05 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <Upload className={`w-16 h-16 mx-auto mb-4 ${
                isDragActive || dropzoneActive 
                  ? 'text-blue-500' 
                  : 'text-gray-400'
              }`} />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {isDragActive || dropzoneActive ? 'Drop files here' : 'Upload Files'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Drag and drop files here, or click to browse
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                <Badge variant="secondary" className="text-xs">
                  Max {maxFiles} files
                </Badge>
            <Badge variant="secondary" className="text-xs">
                  Up to {maxSizeMB}MB each
            </Badge>
          </div>
              <Button variant="outline" className="glass-effect">
                <Upload className="w-4 h-4 mr-2" />
                Choose Files
              </Button>
            </motion.div>
        </CardContent>
      </Card>

        {/* Upload Progress */}
        <AnimatePresence>
      {uploadingFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Upload Progress ({uploadingFiles.length})
                </h4>
                {uploadingFiles.some(f => f.status === 'success') && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearCompleted}
                    className="text-xs"
                  >
                    Clear Completed
                  </Button>
                )}
              </div>

              {uploadingFiles.map((uploadFile, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="glass-effect border-none">
                    <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">
                          {getFileTypeIcon(uploadFile.file.type)}
                </div>
                        
                <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {uploadFile.file.name}
                            </p>
                            <div className="flex items-center space-x-2">
                              {uploadFile.status === 'uploading' && (
                                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                              )}
                              {uploadFile.status === 'success' && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                              {uploadFile.status === 'error' && (
                                <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                                onClick={() => removeFile(index)}
                    className="h-6 w-6 p-0"
                  >
                                <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                            <span>{formatFileSize(uploadFile.file.size)}</span>
                            {uploadFile.status === 'uploading' && (
                              <span>{uploadFile.progress}%</span>
                            )}
                            {uploadFile.status === 'error' && (
                              <span className="text-red-500">{uploadFile.error}</span>
                            )}
                            {uploadFile.status === 'success' && (
                              <span className="text-green-500">Complete</span>
                            )}
        </div>
                          
                          {uploadFile.status === 'uploading' && (
                            <Progress value={uploadFile.progress} className="h-1" />
      )}
    </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FeatureGate>
  );
}

export default FileUpload;