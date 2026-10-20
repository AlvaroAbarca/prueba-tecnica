# ARQUETIPO BACKEND

<p align="center">
  <img src="docs/assets/postgresql.svg" alt="PostgreSQL" height="40" margin="0 10px"/>
  <img src="docs/assets/nodejs.svg" alt="Node.js" height="40" margin="0 10px"/>
  <img src="docs/assets/nestjs.svg" alt="NestJS" height="40" margin="0 10px"/>
  <img src="docs/assets/react.svg" alt="React" height="40" margin="0 10px"/>
  <img src="docs/assets/nextjs.svg" alt="Next.js" height="40" margin="0 10px"/>
</p>

<p align="center">
  <b>PostgreSQL</b> &nbsp;|&nbsp; <b>Node</b> &nbsp;|&nbsp; <b>Nest</b> &nbsp;|&nbsp; <b>React</b> &nbsp;|&nbsp; <b>Next</b>
</p>
<br/>
<div align="justify">
Bienvenido al proyecto base backend para nuevas aplicaciones, construido sobre el stack **PNNR** (PostgreSQL · Node · NestJS · React). Esta versión mínima usa arquitectura hexagonal: CRUD de usuarios, login local con JWT y autorización por roles.
</div>
<br/>

Consulta la documentación en la carpeta [docs/](/docs/) para más detalles.

## Características principales

- **Login local:** Autenticación con bcrypt, JWT y cookie.
- **Roles:** Autorización con `@RolesCan` sobre perfiles y roles persistidos.
- **CRUD de usuarios:** Alta, consulta, edición y baja en un solo módulo hexagonal.
- **Health:** Endpoint de estado del servicio y de la base de datos.
- **Arquitectura hexagonal:** Dominio, aplicación e infraestructura separados.
- **Testing:** Pruebas unitarias con Jest.

## Stack Tecnológico

- **Node.js + NestJS** – Framework principal para construir aplicaciones escalables y mantenibles
- **TypeORM:** ORM para manejo de base de datos relacional PostgreSQL
- **Dayjs:** Manejo de fechas
- **Winston:** Logging a consola
- **Jest:** Testing para pruebas de cobertura, unitarias e integración
- **Docker:** para despliegue en contenedores
- **Swagger:** Documentación API
- **docs:** Carpeta para documentación del proyecto en Markdown
- **Prettier + ESLint:** Formateo y linting de código

---

## Estructura Hexagonal (Clean Architecture)

```plaintext
src/
├── modules/                        # Módulos funcionales (ej: users, auth, correos)
│   ├── <modulo>/                   # Cada módulo sigue la arquitectura hexagonal
│   │   ├── application/            # Casos de uso y servicios de aplicación
│   │   │   ├── use-cases/          # Acciones específicas del módulo
│   │   │   └── services/           # Servicios que agrupan lógica de negocio
│   │   ├── domain/                 # Lógica de dominio y entidades puras
│   │   │   ├── models/             # Entidades del dominio
│   │   │   ├── services/           # Reglas y lógica del dominio
│   │   │   ├── dto/                # DTOs internos (sin decoradores)
│   │   │   ├── interfaces/         # Interfaces hacia servicios externos (puertos de salida)
│   │   │   └── value-objects/      # Objetos de valor y validación
│   │   └── infrastructure/         # Adaptadores externos y persistencia
│   │       ├── persistences/       # Repositorios para acceso a datos
│   │       ├── dto/                # DTOs externos (con decoradores)
│   │       └── controllers/        # Controladores API REST (NestJS)
│   └── shared/                     # Utilidades y recursos comunes para todos los módulos
│       ├── dtos/
│       ├── interceptors/
│       ├── filters/
│       ├── middlewares/
│       └── config/                 # Configuración global, Winston, .env, etc.
│
│
├── main.ts                         # Punto de entrada de la aplicación
└── app.module.ts                   # Módulo raíz de NestJS
```

- **modules:** Cada módulo funcional (ej: users, auth, correos) sigue la arquitectura hexagonal.
- **application:** Casos de uso y servicios de aplicación.
- **domain:** Modelos, reglas de negocio, DTOs internos, interfaces y value objects.
- **infrastructure:** Repositorios, controladores y adaptadores de persistencia.
- **shared:** Utilidades comunes, configuración, interceptores, filtros y middlewares.
- **docs:** Documentación técnica y funcional del proyecto.

---

## Inicio de desarrollo

Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno local siempre usando npm:

1. **Clona el repositorio:**

   ```bash
   git clone <URL-del-repositorio>
   ```

2. **Verifica la versión de Node.js con NVM:**

   Instala [NVM](https://github.com/nvm-sh/nvm) si no lo tienes.

   Usa la versión recomendada (Node.js 22):

   ```bash
   nvm install 22
   nvm use 22
   ```

3. **Instala las dependencias:**

   ```bash
   npm install
   ```

4. **Configura la base de datos PostgreSQL:**

   Asegúrate de tener una instancia de PostgreSQL corriendo y actualiza las variables de conexión en el archivo `.env`.

   puedes usar docker-compose-db.yml para levantar una base de datos PostgreSQL rápidamente en localhost:

   ```bash
   docker compose -f docker-compose-db.yml up -d
   ```

   para detenerla:

   ```bash
   docker compose -f docker-compose-db.yml down -v

   ```

   datos de conexión por defecto:
   - Host: localhost
   - Puerto: 5432
   - Usuario: postgres
   - Contraseña: postgres
   - Base de datos: postgres

5. **Configura las variables de entorno:**

   crea el archivo `.env` con las variables de entorno.
   Puedes basarte en el archivo `.env.example` proporcionado.

6. **Inicia el proyecto en modo desarrollo:**

   ```bash
   npm run dev
   ```

7. **Verifica que el servidor esté corriendo:**

   Abre [http://localhost:8003](http://localhost:8003) en tu navegador.

8. **Accede a la documentación Swagger:**

   Abre [http://localhost:8003/swagger](http://localhost:8003/swagger) en tu navegador.

## Inicio con Docker

1. **Construye la imagen Docker:**
   ```bash
   docker build -t app-back .
   ```
2. **Ejecuta el contenedor:**
   ```bash
   docker run  -d  --name app  -p 3000:3000 app-back
   ```

3.- **Defaul user:**

- Email: pedro.postal@correos.cl
- Password: consultar al equipo de desarrollo
