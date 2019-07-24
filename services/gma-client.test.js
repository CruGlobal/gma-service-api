import GMAClient from './gma-client'
import Axios from 'axios'
import axiosCookieJarSupport from 'axios-cookiejar-support'

describe('GMAClient', () => {
  afterEach(() => {
    Axios.mockResetAll()
  })

  it('should create a new client', () => {
    const gmaClient = new GMAClient('https://www.example.com')
    expect(gmaClient.client).toBeDefined()
    expect(axiosCookieJarSupport).toHaveBeenCalledWith(gmaClient.client)
    expect(gmaClient.cookieJar).toBeDefined()
    expect(gmaClient.client.defaults).toEqual(expect.objectContaining({
      jar: gmaClient.cookieJar,
      maxRedirects: 0,
      withCredentials: true,
      baseURL: 'https://www.example.com'
    }))
  })

  describe('methods', () => {
    let gmaClient
    beforeEach(() => {
      gmaClient = new GMAClient('https://www.example.com')
    })

    describe('request(url = \'\', config = {})', () => {
      it('should return response on success', async () => {
        const response = { body: 'asdf', headers: {} }
        Axios.get.mockResolvedValueOnce(response)
        expect(gmaClient.request()).resolves.toBe(response)
        expect(Axios.get).toHaveBeenCalledWith('', {})
      })

      it('should return response on error (302)', async () => {
        const response = { body: 'asdf', headers: {} }
        const error = new Error('302 Found')
        error.response = response
        Axios.get.mockRejectedValueOnce(error)
        expect(gmaClient.request('foo', { bar: 'baz' })).resolves.toBe(response)
        expect(Axios.get).toHaveBeenCalledWith('foo', { bar: 'baz' })
      })
    })

    describe('getServiceUrl()', () => {
      it('should error if request does not produce a 302', async () => {
        jest.spyOn(gmaClient, 'request')
          .mockResolvedValue({ status: 200, config: { url: 'https://www.example.com' } })
        return expect(gmaClient.getServiceUrl())
          .rejects.toThrow('Expected 302 response code: https://www.example.com')
      })

      it('', async () => {
        jest.spyOn(gmaClient, 'request')
          .mockResolvedValue({
            status: 302,
            headers: { location: 'https://thekey.me/cas/login?service=https://www.example.com/login' }
          })
        return expect(gmaClient.getServiceUrl()).resolves.toEqual('https://www.example.com/login')
      })
    })

    describe('establishSession(serviceUrl, ticket)', () => {
      it('should login', async () => {
        const spy = jest.spyOn(gmaClient, 'request')
        spy.mockResolvedValueOnce({ headers: { location: 'https://www.example.com' } })
        spy.mockResolvedValueOnce({})
        await gmaClient.establishSession('https://www.example.com/login', 'asdf1234')
        expect(spy).toHaveBeenCalledWith('https://www.example.com/login?ticket=asdf1234')
      })
    })

    describe('getActiveUsers()', () => {
      it('requests list of active users', async () => {
        jest.spyOn(gmaClient, 'request').mockResolvedValueOnce({})
        await gmaClient.getActiveUsers()
        expect(gmaClient.request).toHaveBeenCalledWith('', { params: { q: 'gmaservices/gma_user', type: 'active' } })
      })
    })
  })
})
