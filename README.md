# Event Management API con Node.js, Express y DynamoDB

Este proyecto consiste en una **API REST** para la gestión de eventos, usuarios, notificaciones y registros. Utiliza **Node.js** con **Express** como framework principal y **Amazon DynamoDB** como base de datos NoSQL. El despliegue se realiza en una instancia **Amazon EC2** con la configuración de red en **VPC**.

## 1. Introducción al objetivo de la práctica

El objetivo es contar con un sistema que permita:

- **Registro e inicio de sesión** de usuarios con JWT (autenticación).  
- **CRUD de eventos** (crear, leer, actualizar, eliminar).  
- **Inscripción** de usuarios a eventos (registrations).  
- **Gestión de notificaciones** vía correos electrónicos o mensajes.  
- **Protección** de rutas con JWT y roles (user / admin).

La aplicación se compone de varias capas:
1. **Modelos** (interacción con DynamoDB a través del SDK de AWS).  
2. **Controladores** (lógica principal).  
3. **Rutas** (endpoints en Express).  
4. **Servicios** (JWT, bcrypt, envío de correos, etc.).  
5. **Middlewares** (autenticación, validación de roles).  

Se asume que las tablas de DynamoDB se encuentran creadas:  
- **Users** (PK = `userId`), con un GSI para `email`.  
- **Events** (PK = `eventId`).  
- **Registrations** (PK = `registrationId`).  
- **Notifications** (PK = `notificationId`).

---

## 2. Configuración de la Red y la Instancia EC2

### 2.1. Configuración de la Red con Amazon VPC

1. **Crear VPC**: Se configuró una VPC llamada `node-js-server` con rango `10.0.0.0/16`.  
2. **Crear Subred**: Se creó la subred `public-subnet-nodejs` con CIDR `10.0.1.0/24`.  
3. **Gateway de Internet**: Se creó e **asoció** la IGW (`nodejs-server-igw`) a la VPC.  
4. **Tabla de Rutas**: Se configuró la ruta `0.0.0.0/0` hacia la IGW y se asoció la subred `public-subnet-nodejs` a dicha tabla.

### 2.2. Lanzamiento y Configuración de la Instancia EC2

1. **Lanzar una AMI de Amazon Linux 2** con un tipo `t2.micro`.  
2. **Configurar Grupo de Seguridad** para permitir:  
   - **SSH (puerto 22)** desde la IP local.  
   - **HTTP (puerto 80)**, o el **TCP** en el que corre la aplicación (por ejemplo, 3000 o 5000).  
3. **Par de Claves**: Descargar/usar un key pair para conectarse vía SSH.

### 2.3. Instalación de Node.js en la Instancia

1. **Conectarse a la instancia** por SSH:  
   ```bash
   ssh -i "ruta/a/clave.pem" ec2-user@<PublicIP>
   ```
2. **Instalar NVM** (Node Version Manager):  
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   source ~/.bashrc
   ```
   Verificar con:  
   ```bash
   nvm --version
   ```
3. **Instalar Node.js** (ejemplo versión 16.x):
   ```bash
   nvm install 16.15.0
   nvm use 16.15.0
   node --version
   npm --version
   ```

Con esto, Node.js y npm quedan listos para desplegar el proyecto.

---

## 3. Estructura de Archivos

Una posible organización (ajusta según tu caso):

```
|-- Config/
|   └── dynamoDB.js
|-- controllers/
|   ├── authController.js
|   ├── eventController.js
|   ├── notificationController.js
|   ├── registrationController.js
|   └── userController.js
|-- middlewares/
|   ├── authMiddleware.js
|   └── roleMiddleware.js
|-- models/
|   ├── userModel.js
|   ├── eventModel.js
|   ├── registrationModel.js
|   └── notificationModel.js
|-- routes/
|   ├── authRoutes.js
|   ├── eventRoutes.js
|   ├── notificationRoutes.js
|   ├── registrationRoutes.js
|   ├── userRoutes.js
|   └── protectedRoutes.js
|-- services/
|   ├── bcryptService.js
|   ├── jwtService.js
|   └── emailService.js (opcional)
|-- utils/
|   ├── handleValidator.js
|   ├── authValidator.js
|   └── ...
|-- .env
|-- .gitignore
|-- app.js
|-- package.json
|-- README.md
```

Puntos clave:
- `app.js`: Punto de entrada, configura Express, middlewares, y rutas.  
- `config/dynamoDB.js`: Carga y exporta el `DynamoDBDocumentClient` de AWS SDK.  
- `models/`: Contiene funciones de CRUD para cada tabla de DynamoDB (`Users`, `Events`, etc.).  
- `controllers/`: Lógica de negocio para cada recurso (autenticación, eventos, notificaciones...).  
- `routes/`: Define endpoints de Express.  
- `.env`: Contiene variables de entorno (p.ej. `JWT_SECRET`, `AWS_REGION`, etc.).  
- `services/`: Lógica reutilizable (bcrypt, JWT).  

---

## 4. Despliegue de la Aplicación en EC2

1. **Clonar tu repositorio** en la instancia:
   ```bash
   cd ~
   git clone https://github.com/usuario/mi-proyecto.git
   cd mi-proyecto
   ```
2. **Instalar dependencias**:
   ```bash
   npm install
   ```
   Asegúrate de haber incluido en tu `package.json` las librerías necesarias (`@aws-sdk`, `express`, `jsonwebtoken`, etc.).
3. **Configurar variables de entorno** (en `.env` o exportarlas):
   ```bash
   echo "JWT_SECRET=miClaveSecreta" >> .env
   echo "AWS_REGION=us-east-1" >> .env
   # Ajusta según tus tablas, credenciales, etc.
   ```
4. **Iniciar el servidor** en modo desarrollo:
   ```bash
   npm run dev
   ```
   o
   ```bash
   node app.js
   ```

---

## 5. Configurar PM2 para Mantener la Aplicación Activa

Para que la aplicación continúe corriendo en segundo plano aun si cierras la sesión SSH, puedes usar **PM2**:

1. **Instalar** PM2 globalmente:
   ```bash
   npm install -g pm2
   ```
2. **Iniciar** tu aplicación con PM2:
   ```bash
   pm2 start app.js --name "event-management-api"
   ```
3. **Verificar** que corre en segundo plano:
   ```bash
   pm2 status
   pm2 logs event-management-api
   ```
4. **Hacer persistentes** los procesos al reiniciar la instancia:
   ```bash
   pm2 save
   pm2 startup
   ```
   Este último comando mostrará instrucciones para habilitar PM2 como servicio.

Con esto, la aplicación se ejecutará aun cuando cierres la conexión SSH.

---

## 6. Pruebas y Endpoints

Una vez en ejecución, puedes acceder a los endpoints (ej. `POST /api/auth/register`) usando Postman o cURL:

- **Registro de usuario**:
  ```bash
  POST http://<PublicIP>:5000/api/auth/register
  Body (JSON):
  {
    "username": "Pedro",
    "email": "pedro@bootcamp.institute",
    "password": "pass12345"
  }
  ```
- **Login de usuario**:
  ```bash
  POST http://<PublicIP>:5000/api/auth/login
  Body (JSON):
  {
    "email": "pedro@bootcamp.institute",
    "password": "pass12345"
  }
  ```
- **Crear evento**:
  ```bash
  POST http://<PublicIP>:5000/api/events
  Headers: { "Authorization": "Bearer <token>" }
  Body (JSON):
  {
    "title": "Nuevo Evento",
    "description": "Descripción",
    "date": "2025-01-01T10:00:00Z",
    "location": "Virtual",
    "type": "conference",
    "capacity": 100
  }
  ```
- **Listar eventos**:
  ```bash
  GET http://<PublicIP>:5000/api/events
  Headers: { "Authorization": "Bearer <token>" }
  ```

Algunas rutas pueden requerir rol de **admin** o el uso de otras validaciones. Revisa tus **middlewares** de autenticación (`authMiddleware.js`) y de rol (`roleMiddleware.js`).

---

## 7. Conclusiones

Tras seguir estos pasos:

1. Has configurado **Amazon VPC** y subred pública para hospedar tu instancia EC2.  
2. Has **instalado Node.js** y clonado tu repositorio en la instancia.  
3. Configuraste las **tablas DynamoDB** (Users, Events, Registrations, Notifications).  
4. Ajustaste **modelos** y **controladores** en Express para usar el SDK de AWS en lugar de MongoDB.  
5. Probaste los endpoints con Postman o cURL, validando que se conecten correctamente a DynamoDB.  
6. Aseguraste la persistencia de la aplicación mediante **PM2**.  

Con ello, tu **API de gestión de eventos** queda desplegada en EC2, lista para producción o para la presentación del laboratorio. ¡Éxito con tu proyecto!
```

---

### Notas Finales

- Ajusta el puerto en el que corre tu aplicación (`APP_PORT` en `.env` o `process.env.APP_PORT`) y el **Security Group** para que permita acceso a dicho puerto.  
- Si en algún momento deseas **SSL** o un **dominio personalizado**, podrías agregar **Nginx** o un **Load Balancer** para manejar certificados TLS.  
- Para un sistema de mensajería más avanzado, podrías integrar **Amazon SES** para el envío de correos o **Amazon SNS** para notificaciones push.  

Con este **README.md** tendrás una **referencia** rápida de los pasos clave de tu proyecto, tanto para la configuración de red e instancia EC2, como para la instalación y persistencia de tu aplicación en producción usando PM2.