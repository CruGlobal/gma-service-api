'use strict'

import AccessToken from '../models/access-token'
import CasClient from '../services/cas-client'
import has from 'lodash/has'

// https://thekey.me/cas/login?service=https://services.gcx.org/gma/auth/login

const loginRoute = async (context) => {
  const casClient = new CasClient(process.env['CAS_URL'])
  context.assert(has(context, 'request.fields.ticket'), 400)
  const ticket = context.request.fields['ticket']
  try {
    const guid = await casClient.serviceValidate(process.env['GMA_SERVICE_API_URL'], ticket)
    const accessToken = await AccessToken.generate(guid)
    if (context.request.header['accept'] === 'text/plain') {
      context.type = 'text/plain'
      context.body = accessToken
    } else {
      context.type = 'application/json'
      context.body = JSON.stringify({ id: accessToken, guid })
    }
  } catch (error) {
    context.throw(401)
  }
}

export default loginRoute
