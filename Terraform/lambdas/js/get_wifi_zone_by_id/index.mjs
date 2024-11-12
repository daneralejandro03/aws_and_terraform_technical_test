import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

const tableName = "Wi-Fi_Zones_Table";

export const handler = async (event) => {
  const zoneId = parseInt(event.pathParameters.id, 10);
  let statusCode = 200;
  let body;

  try {
    const data = await dynamo.send(
      new GetCommand({
        TableName: tableName,
        Key: { id: zoneId },
      })
    );
    body = data.Item ? data.Item : { message: "Zona Wi-Fi no encontrada" };
  } catch (error) {
    statusCode = 500;
    body = { message: "Error al obtener la zona Wi-Fi", error: error.message };
  }

  return {
    statusCode,
    body: JSON.stringify(body),
  };
};
