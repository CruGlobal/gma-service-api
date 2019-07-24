'use strict'

import { DynamoDB, SQS } from 'aws-sdk'
import chunk from 'lodash/chunk'
import map from 'lodash/map'
import rollbar from '../config/rollbar'

export const handler = async (lambdaEvent) => {
  try {
    const db = new DynamoDB({ apiVersion: '2012-08-10' })
    const sqs = new SQS({ apiVersion: '2012-11-05' })
    const servers = await db.scan({
      ExpressionAttributeNames: {
        '#S': 'ServerURL'
      },
      ExpressionAttributeValues: {
        ':enabled': {
          BOOL: true
        }
      },
      FilterExpression: 'Enabled = :enabled',
      ProjectionExpression: '#S',
      TableName: process.env['DYNAMODB_TABLE_NAME']
    }).promise()
    const messages = map(servers.Items, (item, index) => {
      return {
        Id: `${index}`,
        MessageBody: item.ServerURL.S
      }
    })
    return Promise.all(map(chunk(messages, 10), (entries) => sqs.sendMessageBatch({
      QueueUrl: process.env['SQS_QUEUE_URL'],
      Entries: entries
    }).promise()))
  } catch (error) {
    rollbar.error('enqueue-servers error', error)
    return Promise.reject(error)
  }
}
