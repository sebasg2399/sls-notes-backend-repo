"use strict";
const AWS = require("aws-sdk");
const util = require("./util.js");
AWS.config.update({ region: "us-east-1" });

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.NOTES_TABLE;

exports.handler = async function (event) {
  try {
    let query = event.queryStringParameters;
    let limit = query && query.limit ? parseInt(query.limit): 5
    let user_id = util.getUserId(event.headers)

    let params = {
      TableName: tableName,
      KeyConditionExpression: "user_id = :uid",
      ExpressionAttributeValues: {
        ":uid": user_id
      },
      Limit: limit,
      ScanIndexForward: false
    }
    let startTimeStamp = query && query.start ? parseInt(query.start) : 0;

    if(startTimeStamp > 0){
      params.ExclusiveStartKey = {
        user_id: user_id,
        timestamp: startTimeStamp
      }
    }

    let data = await dynamoDB.query(params).promise()

    return {
      statusCode: 200,
      headers: util.getResponseHeaders(),
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.log("Error", err);
    return {
      statusCode: err.statusCode || "500",
      headers: util.getResponseHeaders(),
      body: JSON.stringify({
        error: err.name || "exception",
        message: err.message || "Unknown error",
      }),
    };
  }
};
