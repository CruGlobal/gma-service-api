#!/usr/bin/env node

const fs = require('fs')
const parse = require('csv-parse/lib/sync')
const DynamoDB = require('aws-sdk').DynamoDB

const client = new DynamoDB({ apiVersion: '2012-08-10', region: 'us-east-1' })
const [filename] = process.argv.slice(2)
if (!filename) throw new Error('Missing CSV filename as argument.')

const data = fs.readFileSync(filename)
const servers = parse(data, { columns: true })

const requests = servers.map(server => ({
  PutRequest: {
    Item: {
      'ServerURL': {
        'S': server.ServerURL
      },
      'Id': {
        'N': server.Id
      },
      'Name': {
        'S': server.Name
      },
      'Enabled': {
        'BOOL': server.Enabled === '1'
      },
      'Password': {
        'S': server.Password
      },
      'User': {
        'S': server.User
      },
      'Guids': {
        'SS': [
          '00000000-0000-0000-0000-000000000000'
        ]
      }
    }
  }
}))

async function writeItems (items) {
  await client.batchWriteItem({
    RequestItems: {
      'gma-service-api-production-GMAServersDynamoDbTable-16ZCZWL4CJZLV': items
    }
  }).promise()
}
writeItems(requests)
