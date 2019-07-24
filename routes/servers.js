'use strict'

import AccessToken from '../models/access-token'
import { DynamoDB } from 'aws-sdk'
import map from 'lodash/map'

const serversRoute = async (context, next) => {
  const accessToken = AccessToken.fromContext(context)
  context.assert(accessToken, 401)

  const guid = await AccessToken.findGuid(accessToken)
  context.assert(guid, 401)
  const DocumentClient = new DynamoDB.DocumentClient()
  const serverItems = await DocumentClient.scan({
    TableName: process.env['DYNAMODB_TABLE_NAME'],
    ScanFilter: {
      Guids: {
        ComparisonOperator: 'CONTAINS',
        AttributeValueList: [guid]
      },
      Enabled: {
        ComparisonOperator: 'EQ',
        AttributeValueList: [true]
      }
    },
    AttributesToGet: ['ServerURL', 'Name', 'Id']
  }).promise()

  const servers = map(serverItems.Items, (item, index) => {
    return {
      id: `${item.Id}`,
      name: item.Name,
      uri: item.ServerURL
    }
  })

  context.type = 'application/json'
  context.body = JSON.stringify(servers)
}

export default serversRoute
