const DynamoDB = jest.fn()
DynamoDB._scanMock = jest.fn()
DynamoDB._scanPromiseMock = jest.fn()
DynamoDB.mockImplementation(() => ({
  scan: DynamoDB._scanMock
}))
DynamoDB._scanMock.mockImplementation(() => ({
  promise: DynamoDB._scanPromiseMock
}))

const DocumentClient = jest.fn()
DocumentClient._getMock = jest.fn()
DocumentClient._getPromiseMock = jest.fn()
DocumentClient._updateMock = jest.fn()
DocumentClient._updatePromiseMock = jest.fn()
DocumentClient.mockImplementation(() => ({
  get: DocumentClient._getMock,
  update: DocumentClient._updateMock
}))
DocumentClient._getMock.mockImplementation(() => ({
  promise: DocumentClient._getPromiseMock
}))
DocumentClient._updateMock.mockImplementation(() => ({
  promise: DocumentClient._updatePromiseMock
}))
DynamoDB.DocumentClient = DocumentClient

const SQS = jest.fn()
SQS._sendMessageBatchMock = jest.fn()
SQS._sendMessageBatchPromiseMock = jest.fn()
SQS.mockImplementation(() => ({
  sendMessageBatch: SQS._sendMessageBatchMock
}))
SQS._sendMessageBatchMock.mockImplementation(() => ({
  promise: SQS._sendMessageBatchPromiseMock
}))

const AWS = {
  DynamoDB,
  SQS
}

export { AWS as default, DynamoDB, SQS }
