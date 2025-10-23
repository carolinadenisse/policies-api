# API de Gestión de Pólizas – Prueba Técnica Backend

## Descripción general
Esta API fue desarrollada como parte de la **prueba técnica para el proceso de selección de Vida Cámara**, simulando un entorno real de negocio del área de **seguros de salud**.  
Su objetivo es **gestionar el ciclo de vida de las pólizas** (emisión, activación, anulación), ofreciendo endpoints RESTful con validaciones, autenticación y documentación interactiva.

El proyecto se construyó utilizando **NestJS**, aplicando **principios SOLID**, **Clean Architecture** y **buenas prácticas de desarrollo backend**.

---

## Contexto funcional
La API representa un **sistema interno de administración de pólizas** de seguros de salud.  
Desde una perspectiva de negocio, este tipo de solución permite a la organización:

- Mejorar la **trazabilidad** y el **control del estado de las pólizas**.  
- **Reducir tiempos administrativos**, automatizando tareas manuales.  
- Garantizar la **integridad de la información** entre áreas como operaciones, atención al cliente y facturación.  
- Sentar la base para **integraciones con frontends corporativos o plataformas comerciales**.

El flujo funcional cubre el **ciclo completo de la póliza**:
1. **Creación** - Registro de la póliza emitida.  
2. **Consulta individual** - Visualización de datos específicos por ID.  
3. **Listado general** - Consulta con filtros por estado o rango de fechas.  
4. **Actualización de estado** - Transición de “emitida” → “activa” → “anulada”.

---

## Arquitectura del proyecto
El proyecto se basa en una **arquitectura modular de NestJS**, organizada en capas claras:

src/
├── policies/  **Módulo principal de gestión de pólizas
│ ├── dto/ **Data Transfer Objects (validaciones)
│ ├── entities/ **Entidades TypeORM
│ └── ... **Controladores y servicios
├── common/ **Utilidades, excepciones y constantes
├── app.module.ts **Módulo raíz
└── main.ts **Bootstrap del servidor y configuración global


- **Capa Controller:** gestiona las rutas HTTP y la comunicación con el cliente.  
- **Capa Service:** contiene la lógica de negocio y las reglas funcionales.  
- **Capa Entity:** define la estructura de los datos persistidos en la base.  

---

## Decisiones técnicas
| Tema | Decisión | Justificación |
|------|-----------|----------------|
| **Framework** | NestJS 10.3 | Permite modularidad, inyección de dependencias y tipado fuerte. |
| **Lenguaje** | TypeScript 5.6 | Asegura robustez, escalabilidad y validaciones en tiempo de compilación. |
| **ORM / DB** | TypeORM + SQLite | Simula persistencia real con mínima configuración. Ideal para pruebas. |
| **Autenticación** | JWT + Passport | Permite seguridad y escalabilidad sin sobrecargar el proyecto. |
| **Validaciones** | class-validator / class-transformer | Garantiza consistencia y limpieza en los datos entrantes. |
| **Documentación** | Swagger UI (`@nestjs/swagger`) | Permite probar y visualizar todos los endpoints de forma interactiva. |
| **Gestión de dependencias** | Yarn 4 | Estabilidad y control de versiones reproducible. |
| **Metodología** | Sprint único de 1 día | Simulación de entrega ágil completa con resultados verificables. |

---

## Endpoints principales

| Método | Ruta | Descripción |
|--------|------|--------------|
| `POST` | `/api/auth/login` | Autenticación (devuelve token JWT). |
| `POST` | `/api/policies` | Crea una nueva póliza. |
| `GET` | `/api/policies` | Lista todas las pólizas con filtros opcionales (`estado`, `desde`, `hasta`). |
| `GET` | `/api/policies/:id` | Obtiene una póliza específica. |
| `PUT` | `/api/policies/:id/status` | Actualiza el estado de una póliza. |

---

### Crear .env
PORT=3000
NODE_ENV=development
JWT_SECRET=super-secreto
JWT_EXPIRES=86400
DB_TYPE=sqlite
DB_DATABASE=policies.db

### Instrucciones para ejecutar el proyecto:
yarn install     # instalar
yarn build       # compilar
yarn start:dev   # desarrollo

### Instrucciones para visualizar swagger
Swagger UI:  http://localhost:3000/docs
OpenAPI JSON: http://localhost:3000/docs-json

### Instrucciones para ejecutar Pruebas
yarn test

### Instrucciones para ejecutar Lint
yarn lint

### Instrucciones para ejecutar coverage
El coverage global mínimo es : { branches: 80, functions: 80, lines: 80, statements: 80 }

yarn test:cov




