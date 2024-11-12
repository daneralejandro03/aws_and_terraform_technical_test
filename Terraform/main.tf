provider "aws" {
  region = "us-east-1"
}

# Crear API Gateway HTTP y Configuración de CORS
resource "aws_apigatewayv2_api" "wifi_zones_api" {
  name          = "Wi-Fi_Zones_API"
  description   = "API Gateway para gestionar las zonas Wi-Fi"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["http://localhost:3000", "http://192.168.1.4:3000"]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["Content-Type", "Authorization", "X-Amz-Date", "X-Api-Key", "X-Amz-Security-Token"]
  }
}


# Método POST para crear una zona Wi-Fi
resource "aws_apigatewayv2_integration" "post_wifi_zone_integration" {
  api_id                 = aws_apigatewayv2_api.wifi_zones_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.create_zone.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "post_wifi_zone" {
  api_id    = aws_apigatewayv2_api.wifi_zones_api.id
  route_key = "POST /wifi-zones"
  target    = "integrations/${aws_apigatewayv2_integration.post_wifi_zone_integration.id}"
}

# Método GET para obtener todas las zonas Wi-Fi
resource "aws_apigatewayv2_integration" "get_wifi_zones_integration" {
  api_id                 = aws_apigatewayv2_api.wifi_zones_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.get_zones.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "get_wifi_zones" {
  api_id    = aws_apigatewayv2_api.wifi_zones_api.id
  route_key = "GET /wifi-zones"
  target    = "integrations/${aws_apigatewayv2_integration.get_wifi_zones_integration.id}"
}

# Método GET para obtener una zona Wi-Fi por ID
resource "aws_apigatewayv2_integration" "get_wifi_zone_by_id_integration" {
  api_id                 = aws_apigatewayv2_api.wifi_zones_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.get_zone_by_id.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "get_wifi_zone_by_id" {
  api_id    = aws_apigatewayv2_api.wifi_zones_api.id
  route_key = "GET /wifi-zones/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.get_wifi_zone_by_id_integration.id}"
}

# Método PUT para actualizar una zona Wi-Fi
resource "aws_apigatewayv2_integration" "update_wifi_zone_integration" {
  api_id                 = aws_apigatewayv2_api.wifi_zones_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.update_zone.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "update_wifi_zone" {
  api_id    = aws_apigatewayv2_api.wifi_zones_api.id
  route_key = "PUT /wifi-zones/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.update_wifi_zone_integration.id}"
}

# Método DELETE para eliminar una zona Wi-Fi
resource "aws_apigatewayv2_integration" "delete_wifi_zone_integration" {
  api_id                 = aws_apigatewayv2_api.wifi_zones_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.delete_zone.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "delete_wifi_zone" {
  api_id    = aws_apigatewayv2_api.wifi_zones_api.id
  route_key = "DELETE /wifi-zones/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.delete_wifi_zone_integration.id}"
}

# Crear el bucket de S3
resource "aws_s3_bucket" "wifi_zones_bucket" {
  bucket = "archivoswifizonessubida2"
}

/*
resource "aws_s3_bucket_acl" "wifi_zones_bucket_acl" {
  bucket = aws_s3_bucket.wifi_zones_bucket.id
  acl    = "private"
}
*/

# Permisos para las funciones Lambda desde API Gateway
resource "aws_lambda_permission" "create_zone_invoke" {
  statement_id  = "AllowExecutionFromAPIGatewayCreate"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.create_zone.arn
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.wifi_zones_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "get_zones_invoke" {
  statement_id  = "AllowExecutionFromAPIGatewayGetZones"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_zones.arn
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.wifi_zones_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "get_zone_by_id_invoke" {
  statement_id  = "AllowExecutionFromAPIGatewayGetZoneById"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_zone_by_id.arn
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.wifi_zones_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "update_zone_invoke" {
  statement_id  = "AllowExecutionFromAPIGatewayUpdate"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.update_zone.arn
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.wifi_zones_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "delete_zone_invoke" {
  statement_id  = "AllowExecutionFromAPIGatewayDelete"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.delete_zone.arn
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.wifi_zones_api.execution_arn}/*/*"
}

# Despliegue de API Gateway
resource "aws_apigatewayv2_deployment" "wifi_zones_deployment" {
  api_id      = aws_apigatewayv2_api.wifi_zones_api.id
  description = "Deployment for Wi-Fi Zones API"

  triggers = {
    redeployment = sha1(join(",", tolist([
      jsonencode(aws_apigatewayv2_integration.post_wifi_zone_integration),
      jsonencode(aws_apigatewayv2_integration.get_wifi_zones_integration),
      jsonencode(aws_apigatewayv2_integration.get_wifi_zone_by_id_integration),
      jsonencode(aws_apigatewayv2_integration.update_wifi_zone_integration),
      jsonencode(aws_apigatewayv2_integration.delete_wifi_zone_integration),
      jsonencode(aws_apigatewayv2_route.post_wifi_zone),
      jsonencode(aws_apigatewayv2_route.get_wifi_zones),
      jsonencode(aws_apigatewayv2_route.get_wifi_zone_by_id),
      jsonencode(aws_apigatewayv2_route.update_wifi_zone),
      jsonencode(aws_apigatewayv2_route.delete_wifi_zone),
    ])))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_apigatewayv2_stage" "wifi_zones_stage" {
  api_id        = aws_apigatewayv2_api.wifi_zones_api.id
  name          = "dev"
  deployment_id = aws_apigatewayv2_deployment.wifi_zones_deployment.id
  auto_deploy   = true
}

# DynamoDB para almacenar las zonas Wi-Fi
resource "aws_dynamodb_table" "wifi_zones_table" {
  name         = "Wi-Fi_Zones_Table"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "N"
  }
}

# Rol de ejecución para Lambda
resource "aws_iam_role" "lambda_exec_role" {
  name = "lambda_exec_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

# Política de permisos para DynamoDB y CloudWatch
resource "aws_iam_policy" "lambda_dynamodb_policy" {
  name        = "lambda_dynamodb_policy"
  description = "Permite acceso de las funciones Lambda a DynamoDB y CloudWatch"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:DeleteItem",
          "dynamodb:UpdateItem",
          "dynamodb:Scan"
        ]
        Resource = aws_dynamodb_table.wifi_zones_table.arn
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_policy" "lambda_s3_getobject_policy" {
  name        = "lambda_s3_getobject_policy"
  description = "Permite acceso de lectura (GetObject) al bucket S3 específico para Lambda."

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject"
        ]
        Resource = "arn:aws:s3:::archivoswifizonessubida2/*"
      }
    ]
  })
}

# Configurar el permiso para que S3 invoque la función Lambda
resource "aws_lambda_permission" "allow_s3_invoke_lambda" {
  statement_id  = "AllowS3InvokeLambda"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.subir_archivos_csv_wifi_zones.arn
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.wifi_zones_bucket.arn
}

# Asociar la política de permisos al rol Lambda
resource "aws_iam_role_policy_attachment" "lambda_dynamodb_attach" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = aws_iam_policy.lambda_dynamodb_policy.arn
}

resource "aws_iam_role_policy_attachment" "attach_lambda_s3_getobject_policy" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = aws_iam_policy.lambda_s3_getobject_policy.arn
}
# Crear las funciones Lambda
resource "aws_lambda_function" "create_zone" {
  function_name = "create_wifi_zone"
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  role          = aws_iam_role.lambda_exec_role.arn
  filename      = "lambdas/js/create_wifi_zone.zip"
}

resource "aws_lambda_function" "get_zones" {
  function_name = "get_wifi_zones"
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  role          = aws_iam_role.lambda_exec_role.arn
  filename      = "lambdas/js/get_wifi_zones.zip"
}

resource "aws_lambda_function" "get_zone_by_id" {
  function_name = "get_wifi_zone_by_id"
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  role          = aws_iam_role.lambda_exec_role.arn
  filename      = "lambdas/js/get_wifi_zone_by_id.zip"
}

resource "aws_lambda_function" "update_zone" {
  function_name = "update_wifi_zone"
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  role          = aws_iam_role.lambda_exec_role.arn
  filename      = "lambdas/js/update_wifi_zone.zip"
}

resource "aws_lambda_function" "delete_zone" {
  function_name = "delete_wifi_zone"
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  role          = aws_iam_role.lambda_exec_role.arn
  filename      = "lambdas/js/delete_wifi_zone.zip"
}

# Crear la función Lambda para procesar archivos subidos csv
resource "aws_lambda_function" "subir_archivos_csv_wifi_zones" {
  function_name = "Subir_Archivos_CSV_WIFI_ZONES"
  handler       = "subir_archivos_csv_wifi_zones.lambda_handler"
  runtime       = "python3.12"
  role          = aws_iam_role.lambda_exec_role.arn
  filename      = "lambdas/py/subir_archivos_csv_wifi_zones.zip"
  timeout       = 240
}


# Crear la notificación de S3 para invocar Lambda al subir archivos
resource "aws_s3_bucket_notification" "s3_to_lambda_notification" {
  bucket = aws_s3_bucket.wifi_zones_bucket.id

  lambda_function {
    lambda_function_arn = aws_lambda_function.subir_archivos_csv_wifi_zones.arn
    events              = ["s3:ObjectCreated:*"]
  }

  depends_on = [aws_lambda_permission.allow_s3_invoke_lambda]
}
