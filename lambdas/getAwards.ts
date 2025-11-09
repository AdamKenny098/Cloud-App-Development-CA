import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {DynamoDBDocumentClient, QueryCommand, QueryCommandInput,} from "@aws-sdk/lib-dynamodb";

const ddbDocClient = createDocumentClient();

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    console.log("[EVENT]", JSON.stringify(event.queryStringParameters));

    const params = event.queryStringParameters || {};
    const movieId = params.movie;
    const actorId = params.actor;
    const awardBody = params.awardBody;

    if (!movieId && !actorId) {
      return {
        statusCode: 400,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: "You must provide at least a movie or actor parameter.",
        }),
      };
    }

    const results: any[] = [];

    if (movieId) {
      const movieQuery: QueryCommandInput = {
        TableName: process.env.TABLE_NAME,
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: { ":pk": `w${movieId}` },
      };

      if (awardBody) {
        movieQuery.KeyConditionExpression += " AND SK = :sk";
        movieQuery.ExpressionAttributeValues![":sk"] = awardBody;
      }

      const movieRes = await ddbDocClient.send(new QueryCommand(movieQuery));
      results.push(...(movieRes.Items || []));
    }

    if (actorId) {
      const actorQuery: QueryCommandInput = {
        TableName: process.env.TABLE_NAME,
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: { ":pk": `w${actorId}` },
      };

      if (awardBody) {
        actorQuery.KeyConditionExpression += " AND SK = :sk";
        actorQuery.ExpressionAttributeValues![":sk"] = awardBody;
      }

      const actorRes = await ddbDocClient.send(new QueryCommand(actorQuery));
      results.push(...(actorRes.Items || []));
    }

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ data: results }),
    };
  } catch (error: any) {
    console.log("Error:", error);
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: error.message }),
    };
  }
};

function createDocumentClient() {
  const ddbClient = new DynamoDBClient({ region: process.env.REGION });
  const marshallOptions = {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  };
  const unmarshallOptions = { wrapNumbers: false };
  const translateConfig = { marshallOptions, unmarshallOptions };
  return DynamoDBDocumentClient.from(ddbClient, translateConfig);
}
