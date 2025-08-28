/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { POST } from '@/app/api/files/presigned-url/route'

// Mock Clerk auth
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}))

// Mock S3 utilities
jest.mock('@/lib/s3', () => ({
  generatePresignedUploadUrl: jest.fn(),
  generateFileKey: jest.fn(),
}))

const mockAuth = require('@clerk/nextjs/server').auth
const mockS3 = require('@/lib/s3')

describe('/api/files/presigned-url', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 if user is not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null })

    const request = new NextRequest('http://localhost:3000/api/files/presigned-url', {
      method: 'POST',
      body: JSON.stringify({
        fileName: 'test.jpg',
        fileType: 'image/jpeg',
        fileSize: 1024,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 400 if required parameters are missing', async () => {
    mockAuth.mockResolvedValue({ userId: 'test-user-id' })

    const request = new NextRequest('http://localhost:3000/api/files/presigned-url', {
      method: 'POST',
      body: JSON.stringify({
        fileName: 'test.jpg',
        // Missing fileType and fileSize
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Missing required parameters')
  })

  it('should return 400 if file size exceeds limit', async () => {
    mockAuth.mockResolvedValue({ userId: 'test-user-id' })

    const request = new NextRequest('http://localhost:3000/api/files/presigned-url', {
      method: 'POST',
      body: JSON.stringify({
        fileName: 'huge-file.jpg',
        fileType: 'image/jpeg',
        fileSize: 200 * 1024 * 1024 * 1024, // 200GB - way over limit
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('File size exceeds limit')
  })

  it('should return presigned URL for valid request', async () => {
    mockAuth.mockResolvedValue({ userId: 'test-user-id' })
    mockS3.generateFileKey.mockReturnValue('uploads/test-user-id/123-test.jpg')
    mockS3.generatePresignedUploadUrl.mockResolvedValue('https://s3.amazonaws.com/presigned-url')

    const request = new NextRequest('http://localhost:3000/api/files/presigned-url', {
      method: 'POST',
      body: JSON.stringify({
        fileName: 'test.jpg',
        fileType: 'image/jpeg',
        fileSize: 1024 * 1024, // 1MB
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      uploadUrl: 'https://s3.amazonaws.com/presigned-url',
      fileKey: 'uploads/test-user-id/123-test.jpg',
      fileName: 'test.jpg',
      fileType: 'image/jpeg',
      fileSize: 1024 * 1024,
    })

    expect(mockS3.generateFileKey).toHaveBeenCalledWith('test-user-id', 'test.jpg')
    expect(mockS3.generatePresignedUploadUrl).toHaveBeenCalledWith(
      'uploads/test-user-id/123-test.jpg',
      'image/jpeg'
    )
  })

  it('should handle S3 errors gracefully', async () => {
    mockAuth.mockResolvedValue({ userId: 'test-user-id' })
    mockS3.generateFileKey.mockReturnValue('uploads/test-user-id/123-test.jpg')
    mockS3.generatePresignedUploadUrl.mockRejectedValue(new Error('S3 error'))

    const request = new NextRequest('http://localhost:3000/api/files/presigned-url', {
      method: 'POST',
      body: JSON.stringify({
        fileName: 'test.jpg',
        fileType: 'image/jpeg',
        fileSize: 1024,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })
})
