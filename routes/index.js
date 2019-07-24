'use strict'

import createRouter from 'koa-bestest-router'
import serviceRoute from './service'
import loginRoute from './login'
import sessionRoute from './session'
import serversRoute from './servers'

export const routerMiddleware = createRouter({
  GET: {
    '/gma/auth/service': serviceRoute,
    '/gma/servers': serversRoute,
    '/gma/:accessToken?/servers': serversRoute
  },
  POST: {
    '/gma/auth/login': loginRoute
  },
  DELETE: {
    '/gma/auth/session/:accessToken?': sessionRoute
  }
})

export default routerMiddleware
