import CasClient from './cas-client'
import Axios from 'axios'

describe('CasClient', () => {
  let casClient
  beforeEach(() => {
    casClient = new CasClient('https://thekey.me/cas', 1234567890, 'abcdefg')
  })
  afterEach(() => {
    Axios.mockResetAll()
  })

  it('should set properties', () => {
    expect(casClient.casUrl).toEqual('https://thekey.me/cas')
    expect(casClient.clientId).toEqual(1234567890)
    expect(casClient.clientSecret).toEqual('abcdefg')
  })

  describe('authenticate(username, password)', () => {
    it('should fetch an access token', async () => {
      Axios.post.mockResolvedValueOnce({ data: { access_token: 'abc123' } })
      await casClient.authenticate('username', 'password')
      expect(Axios.post).toHaveBeenCalledWith(
        'https://thekey.me/cas/api/oauth/token',
        'grant_type=password&scope=fullticket&client_id=1234567890&client_secret=abcdefg&username=username&password=password',
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      )
      expect(casClient.accessToken = 'abc123')
    })
  })

  describe('getTicket(service)', () => {
    it('should error if not authenticated first', async () => {
      await expect(casClient.getTicket('https://www.example.com')).rejects
        .toThrow('CasClient must be authenticated before calling getTicket()')
    })

    it('should get a ticket', async () => {
      const accessToken = 'abc123'
      casClient.accessToken = accessToken
      Axios.get.mockResolvedValueOnce({ data: { ticket: 'ST-123' } })

      await expect(casClient.getTicket('https://www.example.com')).resolves.toEqual('ST-123')
      expect(Axios.get).toHaveBeenCalledWith(
        'https://thekey.me/cas/api/oauth/ticket?service=https%3A%2F%2Fwww.example.com', {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        })
    })
  })

  describe('serviceValidate(service, ticket)', () => {
    it('should validate ticket and return ssoGuid', async () => {
      const guid = 'ABC-DEF-123-456-789'
      Axios.get.mockResolvedValueOnce({
        data: {
          serviceResponse: {
            authenticationSuccess: {
              attributes: { ssoGuid: [guid] }
            }
          }
        }
      })

      await expect(casClient.serviceValidate('https://www.example.com', 'ST-123')).resolves.toEqual(guid)
      expect(Axios.get).toHaveBeenCalledWith('https://thekey.me/cas/serviceValidate?service=https%3A%2F%2Fwww.example.com&ticket=ST-123&format=JSON')
    })

    it('should throw Unauthorized if ticket invalid', async () => {
      Axios.get.mockResolvedValueOnce({ data: { serviceResponse: { authenticationFailure: {} } } })
      await expect(casClient.serviceValidate('https://www.example.com', 'ST-123'))
        .rejects.toThrow('Unauthorized')
    })
  })
})
