'use strict'

import AccessToken from '../models/access-token'

const sessionRoute = async (context, next) => {
  let accessToken = AccessToken.fromContext(context)
  if (typeof accessToken === 'undefined') {
    context.status = 400
    return
  }
  await AccessToken.destroy(accessToken)
  context.status = 200
}

export default sessionRoute
