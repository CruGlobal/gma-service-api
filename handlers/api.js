'use strict'

import ServerlessHttp from 'serverless-http'
import Koa from 'koa'
import bodyParserMiddleware from 'koa-better-body'
import routerMiddleware from '../routes'
import { forEach, get } from 'lodash'

const app = new Koa()

// Automatically parse POST body
app.use(bodyParserMiddleware({ encoding: 'utf-8' }))

// Add www-authenticate header to 401 responses
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (error) {
    if (error.status === 401) {
      error.headers = error.headers || {}
      error.headers['WWW-Authenticate'] = `CAS realm="gma", casUrl="${process.env['CAS_URL']}", service="${
        process.env['GMA_SERVICE_API_URL']
      }"`
    }
    throw error
  }
})

// Setup routes
app.use(routerMiddleware)

const serverlessHandler = ServerlessHttp(app)
export const handler = async (lambdaEvent, context) => {
  if (get(lambdaEvent, 'requestContext.elb')) {
    forEach(lambdaEvent.queryStringParameters, (value, key) => {
      lambdaEvent.queryStringParameters[key] = decodeURIComponent(value)
    })
  }
  const result = await serverlessHandler(lambdaEvent, context)
  return result
}
