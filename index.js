"use strict";

global.WebSocket = require('ws');
require('isomorphic-fetch')
require('es6-promise').polyfill();

const AWSAppSyncClient = require('aws-appsync').default;
const AWS = require('aws-sdk');
const gql = require('graphql-tag');

AWS.config.update({
  region: 'eu-west-1',
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

  // const mutate = gql`
  //   mutation MyMutation {
  //     requestFirmwareUpdate(materialNumber: "4.683-209.0", serialNumber: "0361681", version: "1.0.0.") {
  //       updateId
  //     }
  //   }
  // `

  const mutate = gql`
    mutation MyMutation {
      startFirmwareUpdate(input: {deviceId: "q6HacCs8ptMoDfRZhFdk2x", firmware: {materialNumber: "1.783-465.2", serialNumber: "12345670", version: "1.0.6"}, requester: "DM123456"}) {
        deviceId
        firmware {
          materialNumber
          serialNumber
          version
        }
        requester
        updateId
      }
}
  `

  // const subquery = gql`
  //   subscription MySubscription {
  //     onUpdateStudent {
  //       __typename
  //       id
  //       name
  //     }
  //   }
  // `

  const subquery = gql`
    subscription MySubscription($updateId: String!) {
      onFirmwareUpdateStatusChange(updateId: $updateId) {
        updateId
        ... on FirmwareUpdateFailed {
          __typename
          publishedAt
          status
          updateId
        }
        ... on FirmwareUpdateProgressed {
          __typename
          details {
            progress
          }
          publishedAt
          updateId
          status
        }
        ... on FirmwareUpdateSucceeded {
          __typename
          publishedAt
          status
          updateId
        }
      }
    }
  `;

  try {
    const appsyncClient = new AWSAppSyncClient({
      url: 'https://px2z5u3sonbpdfu7dexv7g6ulu.appsync-api.eu-west-1.amazonaws.com/graphql',
      // url: 'https://thxzkiq3tzhgfpte2h3fwq7ysm.appsync-api.eu-west-1.amazonaws.com/graphql',
      region: 'eu-west-1',
      // NOTE: the directive @aws_api_key is set implicitly for all types by default
      // auth: {
      //   type: 'API_KEY',
      //   apiKey: 'da2-hgbxz2dbyzcyti5dsp4iyhl4rm',
      // },
      // auth: {
      //   type: 'AWS_IAM',
      //   credentials: AWS.config.credentials,
      // },
      auth: {
        type: 'AMAZON_COGNITO_USER_POOLS',
        jwtToken: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Im5aZnQ3b0R6V3QxaUNiTnZWWHlvLWVfS1pTNCIsImtpZCI6Im5aZnQ3b0R6V3QxaUNiTnZWWHlvLWVfS1pTNCJ9.eyJpc3MiOiJodHRwczovL2xvZ2luLXN0YWdlLmFwcC5rYWVyY2hlci5jb20iLCJhdWQiOiJodHRwczovL2xvZ2luLXN0YWdlLmFwcC5rYWVyY2hlci5jb20vcmVzb3VyY2VzIiwiZXhwIjoxNjIxMzk1NzQ3LCJuYmYiOjE2MjEzOTIxNDcsImNsaWVudF9pZCI6ImlvdC1hZG1pbiIsInNjb3BlIjpbIm9wZW5pZCIsImVtYWlsIiwiaW90LWZ1bGwtYWRtaW4iLCJpb3Qtc3VwcG9ydCJdLCJzdWIiOiIzOTEzM2I1ZC1mODM2LTQ2MzItOGU1OC05MDUyMmJhNWNmMGMiLCJhdXRoX3RpbWUiOjE2MjEzOTE2MTMsImlkcCI6IkFEIiwianRpIjoiMjY1ZTJmOWRjNzQ3NjA2YzY2NTAxZTkwMDAzZDdkN2MiLCJhbXIiOlsiZXh0ZXJuYWwiXX0.lZM2a9CzD7h5L0jXbzd0UO8BOOnCLMQBZ2n736h07WHg0i907agqEZTDvsvpN0RO5bItbEP-CGIddV5LaoxsxpUWE42KaO_BKgvfCPVH4k9PePXSEndSSAJtMEyG6usMlgpm8h7HiJjayouWrtI1lW_b4V9DdXYAqCJQ-5t_abcGgpt2F03F12f0f7W95_VlC88qaV3M2J-_-HRzHLtH2cw50kAn9VM-gDaMs-6S0GtgQKHcws_YSETp-2EW-SBjR2JNWGmzW0SyEBNE3C79NcPXAaF4UrKfQ9zNVQMJ8H3mHOEgsTvQQ2C8N8tYR5pxkJxgrtlF2L9sAw-QRnAGUmmNs42CLU4p1vR11QOs1idV0kMOwoIyV46BxAyfZZq6wJm4xv86i2zqvymOVEUQQGxgkLhIgzSYCL-wZ239bprFcfHSGhZ8-1dBTOR-6anM4w-eKTWKB3i-TY3Kuq0cGfYyj9iCy_OOP9xLFMmRFyA2DvXyc_77R-Z-WBkrhbKBGjPnrO9F_PdsXbqcyyrFjiYIuhDrD-kr9a4MfDAwSXuIL-ZVUVaf_C7ebKCP1bP13DSe3Fo1OszIbJaCZHtQa3ZAPswEw5vW2O9OAwVcu8l-csaCd58dL7C3D4p7uh1fE7j9mqz8-KGC-fvgvzbq_GNVZgOvt7IWzs0ZU_GCsp4"
      },
      disableOffline: true // concerning
    });

    const client = await appsyncClient.hydrated();
    if (client) {
      const res = await client.mutate({ mutation: mutate });
      console.log('Got the result ', res.data);
      // const res = await client.query({ query: query, });
      // console.log('got the result', res.data);

      if (res.data && res.data?.startFirmwareUpdate?.length) {
        const firmwareUpdate = res.data.startFirmwareUpdate[0];
        const { updateId } = firmwareUpdate;
        console.log("🚀 ~ file: index.js ~ line 122 ~ main ~ updateId", updateId);

        if (updateId) {
          const subscriber = client.subscribe({
            query: subquery,
            variables: {
              updateId: updateId,
            },
          });

          subscriber.subscribe({
            next: function (data) {
              console.log("🚀 updated data in realtime", data);
            },
            complete: console.log,
            error: console.error
          });
        }
      }
    }
  } catch (error) {
    console.log("🚀 ~ file: index.js ~ line 38 ~ main ~ error", error);
  }
}

main()