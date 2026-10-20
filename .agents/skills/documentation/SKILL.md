---
name: documentation
description: Guía para crear o actualizar documentación en la carpeta docs/. Usar cuando se agrega un módulo nuevo, un patrón nuevo, una integración externa, o cualquier decisión técnica relevante que otros desarrolladores necesiten entender.
---

# Documentación en `docs/`

La carpeta `docs/` contiene la documentación técnica del proyecto. **No documentes cambios triviales** (agregar un campo a un DTO, renombrar una variable). Documenta cuando el cambio introduce algo que otro desarrollador necesita entender para trabajar con esa parte del sistema.

## Cuándo crear o actualizar documentación

### Crear un archivo nuevo en `docs/`

| Situación                               | Ejemplo                                                       |
| --------------------------------------- | ------------------------------------------------------------- |
| Módulo nuevo con comportamiento propio  | Nuevo módulo `billing/`                                       |
| Patrón transversal nuevo en el proyecto | Nuevo sistema de caché, nuevo tipo de guard                   |
| Integración con servicio externo        | Nueva API de terceros, nuevo proveedor de mensajería          |
| Decisión de arquitectura no obvia       | Por qué se usa AsyncLocalStorage en lugar de pasar el manager |
| Flujo complejo de varios pasos          | Proceso de despacho con múltiples estados                     |

### Actualizar un archivo existente en `docs/`

| Situación                                          | Archivo a actualizar |
| -------------------------------------------------- | -------------------- |
| Se agrega un tipo de excepción nuevo               | `exceptions.md`      |
| Se agrega un nuevo proveedor de autenticación      | `authentication.md`  |
| Se cambia el comportamiento de las transacciones   | `transactions.md`    |
| Se agrega una nueva migración con patrón diferente | `migrations.md`      |
| Se crea un nuevo rol o permiso                     | `rolesCanSystem.md`  |

### Cuándo NO crear documentación

- Agregar un campo a un DTO o value object → no requiere doc
- Nuevo use case dentro de un módulo ya documentado → no requiere doc
- Corrección de bug → no requiere doc (salvo que cambie el comportamiento público)
- Refactor interno sin cambio de API → no requiere doc

---

## Convenciones de formato

### Nombre de archivo

- `camelCase.md` — ej: `rolesCanSystem.md`, `authentication.md`
- Descriptivo del tema, no del módulo: `exceptions.md` no `sharedModule.md`

### Estructura estándar de un documento

```markdown
# Título del Sistema o Feature

## Índice

1. [Descripción General](#descripción-general)
2. [Arquitectura](#arquitectura)
3. [Componentes Principales](#componentes-principales)
4. [Uso Básico](#uso-básico)
5. [Ejemplos](#ejemplos)
6. [Configuración](#configuración)

---

## Descripción General

Breve descripción del sistema y su propósito dentro del proyecto.

### Características Principales

- **Característica 1**: Descripción
- **Característica 2**: Descripción

---

## Arquitectura

Describe la estructura de archivos y el flujo de datos.

\`\`\`
src/modules/<module>/
├── domain/
│ └── interfaces/
└── infrastructure/
└── persistences/
\`\`\`

---

## Componentes Principales

### 1. NombreDelComponente

**Ubicación:** `src/modules/...`

Descripción del componente y su responsabilidad.

\`\`\`typescript
// Ejemplo de código relevante
\`\`\`

---

## Uso Básico

Instrucciones paso a paso para usar el sistema.

### Paso 1: ...

\`\`\`typescript
// Código de ejemplo
\`\`\`

---

## Ejemplos

### Ejemplo 1: Caso simple

\`\`\`typescript
// Código completo funcional
\`\`\`

---

## Configuración

Variables de entorno, opciones o parámetros necesarios.
```

### Elementos obligatorios

- **Índice** al inicio con anclas `#` a cada sección
- **Descripción general** — qué hace y por qué existe
- **Ubicación de archivos** — rutas exactas dentro del proyecto
- **Ejemplo de código funcional** — al menos un bloque de código real del proyecto

### Elementos opcionales según el tipo de doc

- Diagrama de flujo en texto plano (no imágenes)
- Tabla de métodos o endpoints disponibles
- Sección de errores comunes y cómo resolverlos
- Sección de testing (si hay patrones especiales)

---

## Archivos existentes en `docs/` y su tema

| Archivo                          | Tema                                           |
| -------------------------------- | ---------------------------------------------- |
| `authentication.md` | Login local: JWT, cookies HTTP-only y políticas de cuenta |
| `exceptions.md`     | Sistema de excepciones de dominio                      |
| `migrations.md`     | Creación y ejecución de migraciones TypeORM            |
| `validations.md`    | Sistema de decoradores y Value Objects                 |
| `modelsCreation.md` | Creación de Value Objects y modelos de dominio         |
| `rolesCanSystem.md` | RBAC con `@RolesCan` y `RolesGuard`                    |
| `conventions.md`    | Convenciones de código del proyecto                    |

---

## Checklist antes de terminar

- [ ] ¿El cambio introduce un patrón, módulo o integración nueva? → crear/actualizar doc
- [ ] ¿El archivo tiene tabla de contenidos con anclas funcionales?
- [ ] ¿Hay al menos un ejemplo de código real del proyecto?
- [ ] ¿Las rutas de archivos mencionadas son exactas y existen?
- [ ] ¿El nombre del archivo sigue `camelCase.md`?
- [ ] ¿Se actualizó `docs/README.md` si se agregó un archivo nuevo?
