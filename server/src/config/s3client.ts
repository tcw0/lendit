import {
  ListBucketsCommand,
  ListBucketsCommandOutput,
  S3Client,
  S3ClientConfig,
} from '@aws-sdk/client-s3'
import env from './env'
import { logger } from '../middleware/logger/logger'

const s3Config: S3ClientConfig = {
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY ?? '',
  },
  region: env.AWS_REGION,
}

export const s3Client: S3Client = new S3Client(s3Config)
s3Client
  .send(new ListBucketsCommand({}))
  .then((data: ListBucketsCommandOutput) => {
    if (data.Buckets?.map(b => b.Name).includes(env.AWS_BUCKET_NAME ?? '')) {
      logger.info(
        `Connected to S3Bucket (region: ${env.AWS_REGION}, name: ${env.AWS_BUCKET_NAME}).`,
      )
    } else {
      logger.warn(
        `Connected to S3Bucket (region: ${env.AWS_REGION}) but required bucket ${env.AWS_BUCKET_NAME} not available.`,
      )
    }
  })
  .catch(() => {
    logger.error('Failed to connect to S3Bucket.')
  })
export default s3Client
