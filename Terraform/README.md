# Wi-Fi Zones API Infrastructure

Este proyecto implementa una infraestructura en AWS utilizando Terraform para gestionar una API que administra zonas Wi-Fi. La API permite realizar operaciones CRUD (Crear, Leer, Actualizar y Eliminar) sobre zonas Wi-Fi almacenadas en DynamoDB y soporta la carga de archivos CSV a través de S3, que activa automáticamente una función Lambda.

## Requisitos previos

1. **Terraform**: Asegúrate de tener [Terraform](https://www.terraform.io/downloads.html) instalado.
2. **AWS CLI**: Debes tener configuradas tus credenciales de AWS. Si no lo has hecho, sigue las instrucciones de [configuración de AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html).
3. **ZIP de funciones Lambda**: Este proyecto asume que tienes archivos ZIP de tus funciones Lambda en la carpeta `lambdas/js` para funciones en Node.js y `lambdas/py` para la función en Python.

## Descripción del Proyecto

Este proyecto crea la siguiente infraestructura en AWS:

1. **API Gateway (HTTP)** con soporte para CORS configurado para un frontend.
2. **Funciones Lambda**: Se crean funciones Lambda para manejar cada una de las operaciones CRUD y para procesar archivos CSV cargados en S3.
3. **S3 Bucket**: Un bucket de S3 para almacenar los archivos CSV que luego son procesados por Lambda.
4. **DynamoDB**: Una tabla DynamoDB que almacena los datos de las zonas Wi-Fi.
5. **Roles IAM y Permisos**: Configuración de permisos IAM para que Lambda pueda interactuar con API Gateway, DynamoDB y S3.

## Recursos creados

1. **API Gateway** - `Wi-Fi_Zones_API`

   - Métodos: `GET`, `POST`, `PUT`, `DELETE` (CRUD).
   - Ruta `/wifi-zones/{id}` para obtener o actualizar una zona específica.

2. **Lambda Functions** - Funciones individuales para cada operación:
   - `create_wifi_zone`: Crea una nueva zona Wi-Fi.
   - `get_wifi_zones`: Obtiene todas las zonas Wi-Fi.
   - `get_wifi_zone_by_id`: Obtiene una zona Wi-Fi específica.
   - `update_wifi_zone`: Actualiza una zona Wi-Fi.
   - `delete_wifi_zone`: Elimina una zona Wi-Fi.
   - `subir_archivos_csv_wifi_zones`: Procesa archivos CSV cargados en S3.

| Endpoint           | Method | Description              |
| ------------------ | ------ | ------------------------ |
| `/wifi-zones`      | POST   | Create a Wi-Fi zone      |
| `/wifi-zones`      | GET    | Retrieve all zones       |
| `/wifi-zones/{id}` | GET    | Retrieve a specific zone |
| `/wifi-zones/{id}` | PUT    | Update a Wi-Fi zone      |
| `/wifi-zones/{id}` | DELETE | Delete a Wi-Fi zone      |

3. **DynamoDB Table** - `Wi-Fi_Zones_Table`: Almacena información de las zonas Wi-Fi.
4. **S3 Bucket** - `archivoswifizonessubida2`: Almacena archivos CSV que activan la función Lambda de procesamiento.

## Instalación y Configuración

1. **Clonar el repositorio**:

   ```bash
   git clone <URL del repositorio>
   cd <directorio del proyecto>
   Inicializar Terraform:
   ```

2. **Ejecuta el siguiente comando para inicializar los plugins de Terraform:**

   ```bash
   terraform init
   ```

3. **Aplicar la configuración:**
   **Ejecuta el siguiente comando para desplegar la infraestructura en AWS:**
   ```bash
   terraform apply 
   ```
Escribe yes cuando se te solicite confirmar la creación de los recursos.

## Configuración de CORS

La API Gateway está configurada para permitir peticiones desde los siguientes orígenes:

http://localhost:3000
http://192.168.1.4:3000

Modifica el bloque cors_configuration en aws_apigatewayv2_api si necesitas cambiar estos dominios.

## Detalles de las Funciones Lambda

Cada función Lambda tiene un archivo ZIP correspondiente que debe estar disponible en la ruta indicada:

create_wifi_zone.zip, get_wifi_zones.zip, get_wifi_zone_by_id.zip, update_wifi_zone.zip, delete_wifi_zone.zip en la carpeta lambdas/js/.
subir_archivos_csv_wifi_zones.zip en la carpeta lambdas/py/.
Asegúrate de que estos archivos estén correctamente configurados antes de ejecutar terraform apply.

Configuración de permisos
Se crean políticas IAM y se adjuntan al rol de Lambda para permitir acceso a:

DynamoDB para operaciones CRUD.
CloudWatch para almacenamiento de logs.
S3 para acceder a los archivos cargados.
Despliegue de la API
La API Gateway se despliega automáticamente en la etapa dev. Puedes probar los endpoints accediendo a los métodos correspondientes bajo la URL de la API generada.

Ejemplo de Uso
Puedes hacer peticiones a la API mediante herramientas como curl o Postman. Ejemplo de petición para crear una nueva zona Wi-Fi:

   ```bash
curl -X POST "https://<tu-api-id>.execute-api.us-east-1.amazonaws.com/dev/wifi-zones" \
-H "Content-Type: application/json" \
-d '{"nombre": "Zona 1", "ubicacion": "Parque Central", "disponibilidad": "24/7"}'
```

## Limpieza

Para destruir la infraestructura y liberar recursos en AWS, ejecuta:

```bash
terraform destroy
```

## Notas

Asegúrate de que el bucket S3 archivoswifizonessubida2 esté vacío antes de destruir la infraestructura para evitar problemas de eliminación.
Modifica los valores en el archivo main.tf según tus necesidades específicas de configuración.
