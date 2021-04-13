"use strict";

global.WebSocket = require('ws');
require('isomorphic-fetch')
require('es6-promise').polyfill();

const AWSAppSyncClient = require('aws-appsync').default;
const AWS = require('aws-sdk');
const gql = require('graphql-tag');

AWS.config.update({
  region: 'us-east-1',
  credentials: new AWS.SharedIniFileCredentials({
    profile: 'default'
  }),
});

async function main() {
  const query = gql`
    query MyQuery {
      listEvents(limit: 10) {
        items {
          id
          description
        }
      }
    }
  `;

  const subquery = gql`
    subscription MySubscription {
      onUpdateStudent {
        __typename
        id
        name
      }
    }
  `

  try {
    const appsyncClient = new AWSAppSyncClient({
      url: 'https://vngo677lenfbrdort5c7kobwnu.appsync-api.us-east-1.amazonaws.com/graphql',
      region: 'us-east-1',
      // NOTE: the directive @aws_api_key is set implicitly for all types by default
      auth: {
        type: 'API_KEY',
        apiKey: '<your-api-key>',
      },
      // auth: {
      //   type: 'AWS_IAM',
      //   credentials: AWS.config.credentials,
      // },
      // auth : {
      //   type: 'AMAZON_COGNITO_USER_POOLS',
      //   jwtToken: '<your jwt token (access token) from cognito>',
      // },
      disableOffline: true // concerning
    });

    const client = await appsyncClient.hydrated();
    if (client) {
      const res = await client.query({ query: query, });
      console.log('got the result', res.data);

      const subscriber = client.subscribe({
        query: subquery,
      });

      subscriber.subscribe({
        next: function (data) {
          console.log("🚀 updated student in realtime", data)
        },
        complete: console.log,
        error: console.error
      });
    }
  } catch (error) {
    console.log("🚀 ~ file: index.js ~ line 38 ~ main ~ error", error);
  }
}

main()