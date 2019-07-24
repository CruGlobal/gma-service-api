'use strict'

module.exports = () => {
  // Use dotenv to load local development overrides
  require('dotenv').config()
  return {
    ENVIRONMENT: process.env['ENVIRONMENT'] || 'development',
    ROLLBAR_ACCESS_TOKEN: process.env['ROLLBAR_ACCESS_TOKEN'] || '',
    CAS_URL: process.env['CAS_URL'] || 'https://thekey.me/cas',
    CAS_OAUTH_SECRET: process.env['CAS_OAUTH_SECRET'] || '',
    CAS_OAUTH_CLIENT_ID: process.env['CAS_OAUTH_CLIENT_ID'] || '',
    GMA_SERVICE_API_URL:
      process.env['GMA_SERVICE_API_URL'] ||
      'http://localhost:3000/gma/auth/login',
    REDIS_HOST: process.env['REDIS_HOST'] || '127.0.0.1',
    REDIS_PORT: process.env['REDIS_PORT'] || 6379,
    REDIS_DB: process.env['REDIS_DB'] || 0
  }
}
