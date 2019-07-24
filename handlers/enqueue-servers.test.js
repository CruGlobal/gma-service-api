import { handler } from './enqueue-servers'
import { DynamoDB, SQS } from 'aws-sdk'
import rollbar from '../config/rollbar'

jest.mock('../config/rollbar')

describe('`enqueue-servers` lambda function', () => {
  it('should enqueue servers in SQS', async () => {
    DynamoDB._scanPromiseMock.mockResolvedValue({
      Items: [
        { ServerURL: { S: 'a' } },
        { ServerURL: { S: 'b' } },
        { ServerURL: { S: 'c' } },
        { ServerURL: { S: 'd' } },
        { ServerURL: { S: 'e' } },
        { ServerURL: { S: 'f' } },
        { ServerURL: { S: 'g' } },
        { ServerURL: { S: 'h' } },
        { ServerURL: { S: 'i' } },
        { ServerURL: { S: 'j' } },
        { ServerURL: { S: 'k' } },
        { ServerURL: { S: 'l' } }
      ]
    })
    SQS._sendMessageBatchPromiseMock.mockResolvedValue({})

    await handler()

    expect(DynamoDB).toHaveBeenCalled()
    expect(SQS).toHaveBeenCalled()
    expect(DynamoDB._scanMock).toHaveBeenCalledWith(expect.objectContaining({
      TableName: 'testing'
    }))
    expect(SQS._sendMessageBatchMock).toHaveBeenCalledTimes(2)
  })

  it('should throw and error', async () => {
    DynamoDB._scanPromiseMock.mockRejectedValue(new Error('Ohh noes!'))
    await expect(handler()).rejects.toThrowError('Ohh noes!')
    expect(rollbar.error).toHaveBeenCalled()
  })
})
