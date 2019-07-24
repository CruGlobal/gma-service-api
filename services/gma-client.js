import Axios from 'axios'
import axiosCookieJarSupport from 'axios-cookiejar-support'
import { CookieJar } from 'tough-cookie'

class GMAClient {
  constructor (serverUrl) {
    this.client = Axios.create({ baseURL: serverUrl })
    this.cookieJar = new CookieJar()
    axiosCookieJarSupport(this.client)
    this.client.defaults.jar = this.cookieJar
    this.client.defaults.maxRedirects = 0
    this.client.defaults.withCredentials = true
  }

  /**
   * @param url
   * @param config
   * @returns {Promise<AxiosResponse<T>>}
   * @private
   */
  async request (url = '', config = {}) {
    let response
    try {
      response = await this.client.get(url, config)
    } catch (error) {
      response = error.response
    }
    return response
  }

  async getServiceUrl () {
    // Take location header and cookies and parse service param
    const response = await this.request()
    if (response.status === 302) {
      const location = new URL(response.headers.location)
      return location.searchParams.get('service')
    }
    return Promise.reject(new Error(`Expected 302 response code: ${response.config.url}`))
  }

  async establishSession (serviceUrl, ticket) {
    const loginUrl = new URL(serviceUrl)
    loginUrl.searchParams.set('ticket', ticket)
    const loginResponse = await this.request(loginUrl.toString())
    await this.request(loginResponse.headers.location)
  }

  async getActiveUsers () {
    return this.request('', {
      params: {
        q: 'gmaservices/gma_user',
        type: 'active'
      }
    })
  }
}

export default GMAClient
