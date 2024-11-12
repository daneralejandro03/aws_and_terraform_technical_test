import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

const tableName = "Wi-Fi_Zones_Table";

export const handler = async (event) => {
  const zoneId = parseInt(event.pathParameters.id, 10);
  let statusCode = 200;
  let body;

  try {
    await dynamo.send(
      new DeleteCommand({
        TableName: tableName,
        Key: { id: zoneId },
      })
    );
    body = { message: `Zona Wi-Fi ${zoneId} eliminada correctamente` };
  } catch (error) {
    statusCode = 500;
    body = { message: "Error al eliminar la zona Wi-Fi", error: error.message };
  }

  return {
    statusCode,
    body: JSON.stringify(body),
  };
};
