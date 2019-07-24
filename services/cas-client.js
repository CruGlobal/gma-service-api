import castArray from 'lodash/castArray'
import has from 'lodash/has'
import Axios from 'axios'

class CasClient {
  constructor (casUrl, clientId, clientSecret) {
    this.casUrl = casUrl
    this.clientId = clientId
    this.clientSecret = clientSecret
  }

  async authenticate (username, password) {
    const response = await Axios.post(
      `${this.casUrl}/api/oauth/token`,
      new URLSearchParams({
        grant_type: 'password',
        scope: 'fullticket',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        username: username,
        password: password
      }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    )
    this.accessToken = response.data.access_token
  }

  async getTicket (service) {
    if (typeof this.accessToken === 'undefined') {
      throw new Error('CasClient must be authenticated before calling getTicket()')
    }

    const ticketUrl = new URL(`${this.casUrl}/api/oauth/ticket`)
    ticketUrl.searchParams.set('service', service)
    const response = await Axios.get(ticketUrl.toString(), {
      headers: {
        Authorization: `Bearer ${this.accessToken}`
      }
    })
    return response.data.ticket
  }

  async serviceValidate (service, ticket) {
    const validateUrl = new URL(`${this.casUrl}/serviceValidate`)
    validateUrl.searchParams.set('service', service)
    validateUrl.searchParams.set('ticket', ticket)
    validateUrl.searchParams.set('format', 'JSON')
    const response = await Axios.get(validateUrl.toString())
    const serviceResponse = response.data.serviceResponse
    if (has(serviceResponse, 'authenticationSuccess.attributes.ssoGuid')) {
      return castArray(serviceResponse.authenticationSuccess.attributes.ssoGuid)[0]
    }
    throw new Error('Unauthorized')
  }
}

export default CasClient
