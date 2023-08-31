import { load } from 'ts-dotenv'

/**
 * Environment variables
 */
export default load({
  PORT: {
    type: String,
    optional: false,
  },
  MONGODB_URLLOCAL: {
    type: String,
    optional: false,
  },
  MONGODB_URLREMOTE: {
    type: String,
    optional: false,
  },
  MONGO_INITDB_ROOT_USERNAME: {
    type: String,
    optional: false,
  },
  MONGO_INITDB_ROOT_PASSWORD: {
    type: String,
    optional: false,
  },
  MONGODB_MODE: {
    type: String,
    optional: false,
  },
  SECRET_KEY: {
    type: String,
    optional: false,
  },
  AWS_ACCESS_KEY_ID: {
    type: String,
    optional: false,
  },
  AWS_SECRET_ACCESS_KEY: {
    type: String,
    optional: false,
  },
  AWS_REGION: {
    type: String,
    optional: false,
  },
  AWS_BUCKET_NAME: {
    type: String,
    optional: false,
  },
  MAIL_API_KEY: {
    type: String,
    optional: false,
  },
  FRONTEND_URL: {
    type: String,
    optional: false,
  },
  STRIPE_SECRET_KEY: {
    type: String,
    optional: false,
  },
})
