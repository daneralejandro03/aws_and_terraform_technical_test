import boto3
import csv
import io

# Inicialización de los clientes de S3 y DynamoDB
s3_client = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Wi-Fi_Zones_Table')

def get_last_id():
    try:
        response = table.scan(ProjectionExpression="id")
        ids = [item['id'] for item in response['Items']]
        return max(ids) if ids else 0
    except Exception as e:
        print(f"Error al obtener el último ID: {e}")
        return 0

def record_exists(name, latitude, longitude):
    try:
        response = table.scan(
            FilterExpression='#n = :name AND latitude = :latitude AND longitude = :longitude',
            ExpressionAttributeNames={
                '#n': 'name'  # Cambia 'name' a un alias para evitar conflictos
            },
            ExpressionAttributeValues={
                ':name': name,
                ':latitude': latitude,
                ':longitude': longitude
            }
        )
        return response['Items'] != []
    except Exception as e:
        print(f"Error al verificar duplicados: {e}")
        return False


def lambda_handler(event, context):
    try:
        bucket_name = event['Records'][0]['s3']['bucket']['name']
        s3_file_name = event['Records'][0]['s3']['object']['key']
        
        if not s3_file_name.endswith('.csv'):
            raise ValueError("El archivo no es un CSV.")
        
        # Obtiene el archivo de S3
        resp = s3_client.get_object(Bucket=bucket_name, Key=s3_file_name)
        data = resp['Body'].read().decode("utf-8")
        csv_reader = csv.reader(io.StringIO(data))

        # Verificar encabezados
        headers = next(csv_reader)
        expected_headers = ["NAME", "LATITUDE", "LONGITUDE", "PUNTO ZWF", "PROPIETARIO", "CONTRATO", "SECTOR"]
        if headers != expected_headers:
            raise ValueError("El archivo CSV no tiene los encabezados correctos.")
        
        # Obtener el último ID
        last_id = get_last_id()

        for line_number, zone_data in enumerate(csv_reader, start=2):
            if len(zone_data) != 7:
                print(f"Error de formato en la línea {line_number}: {zone_data}")
                continue

            name = zone_data[0].strip()
            latitude = zone_data[1].strip().replace("'", "")
            longitude = zone_data[2].strip().replace("'", "")

            if record_exists(name, latitude, longitude):
                print(f"Línea {line_number} omitida: registro duplicado ({name})")
                continue

            try:
                last_id += 1
                zone_id = last_id

                table.put_item(
                    Item={
                        'id': zone_id,
                        'name': name,
                        'latitude': latitude,
                        'longitude': longitude,
                        'punto_zwf': zone_data[3],
                        'propietario': zone_data[4],
                        'contrato': zone_data[5],
                        'sector': zone_data[6]
                    }
                )
                print(f"Línea {line_number} insertada correctamente: {name}")
            except Exception as e:
                print(f"Error al insertar los datos en la línea {line_number}: {e}")
    except Exception as e:
        print(f"Error al procesar el archivo de S3: {e}")
