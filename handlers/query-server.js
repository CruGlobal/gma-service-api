'use strict'

import CasClient from '../services/cas-client'
import GmaClient from '../services/gma-client'
import { DynamoDB } from 'aws-sdk'
import rollbar from '../config/rollbar'
import isEmpty from 'lodash/isEmpty'

export const handler = async (lambdaEvent) => {
  try {
    // Parse server url from lambdaEvent
    const serverUrl = lambdaEvent.Records[0].body

    // Get server info from DynamoDB
    const DocumentClient = new DynamoDB.DocumentClient()
    const server = (await DocumentClient.get({
      TableName: process.env['DYNAMODB_TABLE_NAME'],
      Key: { ServerURL: serverUrl }
    }).promise()).Item

    // Initialize clients
    const casClient = new CasClient(process.env['CAS_URL'], process.env['CAS_OAUTH_CLIENT_ID'], process.env['CAS_OAUTH_SECRET'])
    const gmaClient = new GmaClient(server.ServerURL)

    // Request service url and Use OAuth password grant to get token, scope=fullticket
    const [serviceUrl] = await Promise.all([
      gmaClient.getServiceUrl(),
      casClient.authenticate(server.User, server.Password)
    ])

    // Use token to get ticket for service url
    const ticket = await casClient.getTicket(serviceUrl)

    // GET service with ticket and cookies appended, capture cookies, follow redirects
    await gmaClient.establishSession(serviceUrl, ticket)

    // Fetch server url with params to get active users
    const response = await gmaClient.getActiveUsers()
    const guids = response.data.data.map(user => user.GUID).filter(guid => !isEmpty(guid))

    await DocumentClient.update({
      TableName: process.env['DYNAMODB_TABLE_NAME'],
      Key: { ServerURL: serverUrl },
      UpdateExpression: 'set #g = :guids',
      ExpressionAttributeNames: { '#g': 'Guids' },
      ExpressionAttributeValues: { ':guids': guids }
    }).promise()
  } catch (error) {
    rollbar.error('query-server error', error)
    return Promise.reject(error)
  }
}
