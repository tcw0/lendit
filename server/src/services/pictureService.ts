import { UploadedFile } from 'express-fileupload'
import { s3Client } from 'src/config/s3client'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import env from 'src/config/env'
import path from 'path'
import { ApiError, ApiErrorCodes } from 'src/middleware/errorhandler/APIError'
import { logger } from 'src/middleware/logger/logger'

/**
 * Checks if the file is valid img file and not to big.
 * @param {UploadedFile} file the file to check.
 * @throws {ApiError} if the file is invalid or to big.
 */
const checkFile = (file: UploadedFile): void => {
  const fileExts = ['.png', '.jpg', '.jpeg', '.gif']

  // Check allowed extensions
  const isAllowedExt = fileExts.includes(path.extname(file.name).toLowerCase())

  // Mime type must be an image
  const isAllowedMimeType = file.mimetype.startsWith('image/')

  if (!isAllowedExt || !isAllowedMimeType) {
    throw new ApiError(
      ApiErrorCodes.BAD_REQUEST,
      `Invalid file type of ${file.mimetype}.`,
    )
  }

  // Check file size
  const isAllowedSize = file.size <= 1024 * 1024 * 5 // 5mb file size
  if (!isAllowedSize) {
    throw new ApiError(
      ApiErrorCodes.BAD_REQUEST,
      `Invalid file size of ${file.size}.`,
    )
  }
}

/**
 * Uploads a picture to the AWS S3 bucket.
 * @param {UploadedFile} file the file to upload.
 * @throws {ApiError} if the upload failed.
 * @returns {Promise<string>} the url of the uploaded picture.
 */
export const uploadImage = async (file: UploadedFile): Promise<string> => {
  const { name } = file
  checkFile(file)

  const bucketParams = {
    Bucket: env.AWS_BUCKET_NAME,
    Key: `${Date.now()}_${name}`,
    Body: file.data,
    ACL: 'public-read',
  }

  try {
    await s3Client.send(new PutObjectCommand(bucketParams))
    const fileUrl: string = `https://${bucketParams.Bucket}.s3.amazonaws.com/${bucketParams.Key}`
    return fileUrl
  } catch (error) {
    logger.error('Failed to upload file:', error)
    throw new ApiError(
      ApiErrorCodes.INTERNAL_SERVER_ERROR,
      'Failed to upload picture.',
    )
  }
}

export default uploadImage
