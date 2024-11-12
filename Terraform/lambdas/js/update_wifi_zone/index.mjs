import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

const tableName = "Wi-Fi_Zones_Table";

export const handler = async (event) => {
  const data = JSON.parse(event.body);
  const urlId = parseInt(event.pathParameters.id, 10); // Extraemos el id de la URL
  let statusCode = 200;
  let body;

  // Validamos que el id de la URL coincida con el id en el cuerpo de la solicitud
  if (urlId !== data.id) {
    statusCode = 400;
    body = {
      message: `El id de la URL (${urlId}) no coincide con el id en el cuerpo de la solicitud (${data.id})`,
    };
    return {
      statusCode,
      body: JSON.stringify(body),
    };
  }

  // Validación de los datos requeridos
  if (
    !data.id ||
    !data.name ||
    !data.latitude ||
    !data.longitude ||
    !data.punto_zwf ||
    !data.propietario ||
    !data.contrato ||
    !data.sector
  ) {
    statusCode = 400;
    body = { message: "Faltan datos requeridos en la solicitud" };
    return {
      statusCode,
      body: JSON.stringify(body),
    };
  }

  try {
    // Usamos PutCommand para actualizar el item en DynamoDB
    await dynamo.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          id: data.id,
          name: data.name,
          latitude: data.latitude,
          longitude: data.longitude,
          punto_zwf: data.punto_zwf,
          propietario: data.propietario,
          contrato: data.contrato,
          sector: data.sector,
        },
      })
    );
    body = { message: `Zona Wi-Fi ${data.id} actualizada exitosamente` };
  } catch (error) {
    statusCode = 500;
    body = {
      message: "Error al actualizar la zona Wi-Fi",
      error: error.message,
    };
  }

  return {
    statusCode,
    body: JSON.stringify(body),
  };
};
