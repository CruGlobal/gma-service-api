'use strict'

const serviceRoute = async (context, next) => {
  context.type = 'text/plain; charset=utf-8'
  context.body = process.env['GMA_SERVICE_API_URL']
}

export default serviceRoute
