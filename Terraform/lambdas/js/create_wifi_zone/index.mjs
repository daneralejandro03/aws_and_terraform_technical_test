import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

const tableName = "Wi-Fi_Zones_Table";

export const handler = async (event) => {
  const data = JSON.parse(event.body);
  let statusCode = 200;
  let body;

  try {
    // Verificar si el id ya existe en la base de datos
    const existingItem = await dynamo.send(
      new GetCommand({
        TableName: tableName,
        Key: { id: data.id },
      })
    );

    if (existingItem.Item) {
      // Si el id ya existe, retornar error
      statusCode = 400;
      body = { message: `El id ${data.id} ya existe en la base de datos.` };
    } else {
      // Si el id no existe, proceder a insertar el nuevo registro
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
      body = { message: `Zona Wi-Fi ${data.id} creada exitosamente` };
    }
  } catch (error) {
    statusCode = 500;
    body = { message: "Error al crear la zona Wi-Fi", error: error.message };
  }

  return {
    statusCode,
    body: JSON.stringify(body),
  };
};
