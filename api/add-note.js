"use strict";
const AWS = require("aws-sdk");
const util = require("./util.js");
const moment = require("moment");
const uuidv4 = require("uuid").v4;

AWS.config.update({ region: "us-east-1" });

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.NOTES_TABLE;

exports.handler = async function (event) {
  try {
    let item = JSON.parse(event.body).Item;

    item.user_id = util.getUserId(event.headers);
    item.user_name = util.getUserName(event.headers);
    item.note_id = item.user_id + ":" + uuidv4();
    item.timestamp = moment().unix();
    item.expires = moment().add(90, "days").unix();

    let data = await dynamoDB.put({
        TableName: tableName,
        Item: item
    }).promise()

    return {
      statusCode: 200,
      headers: util.getResponseHeaders(),
      body: JSON.stringify(item),
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
