import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

const tableName = "Wi-Fi_Zones_Table";

export const handler = async () => {
  let statusCode = 200;
  let body;

  try {
    const data = await dynamo.send(new ScanCommand({ TableName: tableName }));
    body = data.Items || [];
  } catch (error) {
    statusCode = 500;
    body = { message: "Error al listar las zonas Wi-Fi", error: error.message };
  }

  return {
    statusCode,
    body: JSON.stringify(body),
  };
};
