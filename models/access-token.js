'use strict'

import RedisClient from 'redis'
import uuid4 from 'uuid4'
import has from 'lodash/has'

let _redisClient

class AccessToken {
  static get redisClient () {
    if (_redisClient) {
      return _redisClient
    }
    _redisClient = RedisClient.createClient({
      host: process.env['REDIS_HOST'],
      port: process.env['REDIS_PORT'],
      db: process.env['REDIS_DB']
    })
    return _redisClient
  }

  static async generate (guid) {
    return new Promise((resolve, reject) => {
      const token = uuid4().replace(/-/g, '')
      AccessToken.redisClient.setex(`gma-service-api:${token}`, 3600, guid, (err, _reply) => {
        if (err instanceof RedisClient.RedisError) {
          reject(err)
        } else {
          resolve(token)
        }
      })
    })
  }

  static async findGuid (token) {
    return new Promise((resolve, reject) => {
      AccessToken.redisClient.get(`gma-service-api:${token}`, (err, guid) => {
        if (err instanceof RedisClient.RedisError) {
          reject(err)
        } else {
          resolve(guid)
        }
      })
    })
  }

  static async destroy (token) {
    return new Promise(resolve => {
      AccessToken.redisClient.del([`gma-service-api:${token}`], () => {
        resolve()
      })
    })
  }

  static fromContext (context) {
    let accessToken

    // Parsed from path
    if (has(context, 'params.accessToken')) {
      accessToken = context.params.accessToken
    }

    // Parsed from Authorization: Bearer header
    const authorization = context.request.get('Authorization')
    if (authorization) {
      const parts = authorization.split(' ')
      const key = parts.shift()
      if (key === 'Bearer') {
        accessToken = parts.join(' ')
      }
    }

    return accessToken
  }
}

export default AccessToken
