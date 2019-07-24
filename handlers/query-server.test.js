import { handler as queryServer } from './query-server'
import { DynamoDB } from 'aws-sdk'
import GMAClient from '../services/gma-client'
import CasClient from '../services/cas-client'
import rollbar from '../config/rollbar'

const DocumentClient = DynamoDB.DocumentClient
const mockGetServiceUrl = jest.fn()
const mockEstablishSession = jest.fn()
const mockGetActiveUsers = jest.fn()
const mockAuthenticate = jest.fn()
const mockGetTicket = jest.fn()

jest.mock('../config/rollbar')
jest.mock('../services/gma-client', () => jest.fn().mockImplementation(() => ({
  getServiceUrl: mockGetServiceUrl,
  establishSession: mockEstablishSession,
  getActiveUsers: mockGetActiveUsers
})))
jest.mock('../services/cas-client', () => jest.fn().mockImplementation(() => ({
  authenticate: mockAuthenticate,
  getTicket: mockGetTicket
})))

describe('`query-server` lambda function', () => {
  beforeEach(() => {
    DocumentClient._getPromiseMock.mockReset()
    GMAClient.mockClear()
    CasClient.mockClear()
    mockGetServiceUrl.mockClear()
    mockEstablishSession.mockClear()
    mockGetActiveUsers.mockClear()
    mockAuthenticate.mockClear()
    mockGetTicket.mockClear()
  })

  it('should query GMA server and set active GUIDs in DynamoDB', async () => {
    DocumentClient._getPromiseMock.mockResolvedValueOnce({
      Item: {
        ServerURL: 'https://www.example.com',
        User: 'username',
        Password: 'password'
      }
    })
    mockGetServiceUrl.mockResolvedValueOnce('https://www.example.com')
    mockAuthenticate.mockResolvedValueOnce({})
    mockGetTicket.mockResolvedValueOnce('ST-123')
    mockEstablishSession.mockResolvedValueOnce({})
    mockGetActiveUsers.mockResolvedValueOnce({ data: { data: [{ GUID: 'ABC-123' }, { GUID: 'ABC-456' }, {}, { GUID: '' }] } })
    DocumentClient._updatePromiseMock.mockResolvedValueOnce({})

    await queryServer({ Records: [{ body: 'https://www.example.com' }] })

    expect(DocumentClient._getMock).toHaveBeenCalledWith({
      TableName: 'testing',
      Key: { ServerURL: 'https://www.example.com' }
    })
    expect(GMAClient).toHaveBeenCalledWith('https://www.example.com')
    expect(CasClient).toHaveBeenCalledWith('https://thekey.me/cas', '1234567890', 'secret')
    expect(mockGetServiceUrl).toHaveBeenCalledTimes(1)
    expect(mockAuthenticate).toHaveBeenCalledWith('username', 'password')
    expect(mockGetTicket).toHaveBeenCalledWith('https://www.example.com')
    expect(mockEstablishSession).toHaveBeenCalledWith('https://www.example.com', 'ST-123')
    expect(mockGetActiveUsers).toHaveBeenCalledTimes(1)
    expect(DocumentClient._updateMock).toHaveBeenCalledWith(expect.objectContaining({
      ExpressionAttributeValues: { ':guids': ['ABC-123', 'ABC-456'] }
    }))
  })

  it('should throw if error encountered', async () => {
    DocumentClient._getPromiseMock.mockRejectedValue(new Error('Unknown TableName'))

    await expect(queryServer({ Records: [{ body: 'https://www.example.com' }] }))
      .rejects.toThrow('Unknown TableName')
    expect(rollbar.error).toHaveBeenCalled()
  })
})
