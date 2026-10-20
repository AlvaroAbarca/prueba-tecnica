# Creación de Values Objects y Modelos

## Descripción

En este documento se describen los pasos necesarios para crear un Value Object y un Modelo en el sistema aplicando la estructura de validación automatizada y abstraida. Los Value Objects son objetos que representan un valor inmutable, mientras que los Modelos son entidades que pueden tener un estado mutable y comportamientos asociados.

### Que es un Value Object?

Un Value Object (VO) es un objeto que representa un valor específico de una entidad. Todos los VOs son inmutables y carecen de identidad propia y su igualdad se basa netamente en el valor que contiene. Los VOs son útiles para encapsular lógica de validación y asegurar la integridad de los datos, especialmente para valores que no tienen sentido fuera de su contexto y que estan asociados a una entidad dentro del dominio de nuestro sistema.

### Que es un Modelo?

Un Modelo es una representación de una entidad del dominio que puede tener un estado mutable y comportamientos asociados. A diferencia de los VOs, los Modelos tienen identidad propia y su igualdad se basa en su identidad en lugar de su valor. Los Modelos son útiles para encapsular la lógica de negocio y las reglas de validación que se aplican a una entidad en particular.

## Creación de un Value Object

### Paso 1: Definir el Value Object

Tomaremos de referencia una entidad de ejemplo que servira como modelo.

---

| Campo  | Tipo   | Descripcion                     |
| ------ | ------ | ------------------------------- |
| id     | UUID   | Identificador unico del usuario |
| nombre | String | Nombre completo del usuario     |
| edad   | Number | Edad del usuario                |

---

Para crear un Value Object, primero debes definir la clase que representará el objeto. Asegúrate de que la clase sea inmutable y que implemente las interfaces necesarias para la validación.

```typescript
// src/modules/users/domain/valueObjects/UserName.ts
export class UserName {
  readonly value: string;

  constructor(value: string) {
    this.value = value;
  }

  static create(value: string): UserName {
    return new UserName(value);
  }

  equals(other: UserName): boolean {
    if (!(other instanceof UserName)) return false;
    return this.value === other.value;
  }
}
```

`readonly value` -> `value` es la propiedad que almacena el valor del VO. ocupamos `readonly` para asegurar que el valor no pueda ser modificado una vez creado.

`constructor(value: type)` -> El constructor recibe el valor que se asignará a la propiedad `value`. Asegúrate de que el tipo de `value` sea el correcto.

`static create(value: type): VO` -> Este método estático se utiliza para crear una instancia del Value Object. Se puede agregar lógica adicional de ser necesario, como validadores, transformaciones, sanitazaciones o formateadores. Además es una buena práctica para mantener la inmutabilidad del objeto.

`equals(other: VO): boolean` -> Este método se utiliza para comparar dos instancias del Value Object. Debe verificar si el otro objeto es una instancia del mismo tipo y comparar sus valores. Esto es importante para garantizar que la igualdad se base en el valor y no en la identidad de la instancia, proceso que es crucial para el correcto funcionamiento del sistema al momento de realizar procesos, servicios o transacciones que requieran consistencia.

### Paso 2: Validar el Value Object

Para la validación de nuestros VO utilizaremos nuestro sistema de validación automatizada que tenemos en el dominio (`src/modules/shared/domain/validators/`), el cual nos permite definir reglas de validación de manera declarativa y reutilizable a traves de decoradores.

<small>Para más información sobre el sistema de validación automatizada, consulta el documento [docs/validations.md](./validations.md)</small>

```typescript
// src/modules/users/domain/valueObjects/UserName.ts
import {
  IsRequired,
  IsString,
  Length
  IsAlpha,
} from '../../../shared/domain/validators/decorators';
//Aegurate de importar los decoradores necesarios desde nuestro sistema de validación automatizada.

export class UserName {
  @IsRequired()
  @IsString()
  @Length(3, 15)
  @IsAlpha()
  readonly value: string;

  constructor(value: string) {
    this.value = value;
  }

  static create(value: string): UserName {
    return new UserName(value);
  }

  equals(other: UserName): boolean {
    if (!(other instanceof UserName)) return false;
    return this.value === other.value;
  }
}
```

En este ejemplo, hemos agregado decoradores de validación a la propiedad `value` del Value Object. Estos decoradores se encargan de validar que el valor sea requerido, sea una cadena de texto, tenga una longitud mínima y máxima, y contenga solo caracteres alfabéticos.

Recuerda que para que los decoradores funcionen correctamente, debes invocarlos antes de instanciar el `value` en el constructor. Esto asegura que las validaciones se apliquen antes de que el objeto sea creado.

### Paso 3: Aplicar el validador de VO en el constructor

Para asegurarnos que el valor haya sido debidamente validado, debemos aplicar el validador de VO en el constructor del Value Object. Esto garantiza que cualquier instancia del VO cumpla las reglas de validación definidas y nos permitirá manejar los errores de manera adecuada teniendo claridad de la entidad que gatille el error de validación en caso de tener multiples errores.

```typescript
// src/modules/users/domain/valueObjects/UserName.ts
import {
  IsRequired,
  IsString,
  Length
  IsAlpha,
  ValidateVO, // Importamos el validador de VO
} from '../../../shared/domain/validators/decorators';

export class UserName {
  @IsRequired()
  @IsString()
  @Length(3, 15)
  @IsAlpha()
  readonly value: string;

  constructor(value: string) {
    this.value = value;
    ValidateVO.validate(this, this.constructor.name); // Aplicamos el validador de VO
  }

  static create(value: string): UserName {
    return new UserName(value);
  }

  equals(other: UserName): boolean {
    if (!(other instanceof UserName)) return false;
    return this.value === other.value;
  }
}
```

`ValidateVO.validate(this, this.constructor.name)` -> Este método se encarga de validar el Value Object utilizando las reglas definidas por los decoradores. Si alguna validación falla, lanzará un error con información detallada sobre la entidad que gatilló el error. Debes asegurarte de mandar los dos argumentos correctamente. El primero tomara el valor del VO y el segundo tomara el nombre de la clase del VO, lo cual es importante para identificar la entidad que ha fallado en la validación.

Con esto podrás crear cualquier Value Object siguiendo esta estructura, asegurando que todos los VOs en tu sistema tengan una validación consistente y reutilizable, ahora solo repite el proceso por cada campo que tenga la entidad que deseas modelar 👾

### Paso 4: Crear la definición del mapper del VO (Interno de nuestro sistema)

A continuación debes crear una instancia desde la entidad `ValidateVO` para definir el mapeo de todos los VOs que has creado para un modelo especifico. Esto se hace para que el sistema pueda reconocer las propiedades a las que cada VO corresponde en el marco de la relación clave-valor.

```typescript
// src/modules/users/domain/valueObjects/UserVOBuilder.ts
import { ValidateVO } from '../../../shared/domain/validators/decorators';
import { UserId } from './user-id';
import { UserName } from './user-name';
import { UserAge } from './user-age';

export const UserVOBuilder = ValidateVO.createVODefinition({
  id: UserId,
  name: UserName,
  age: UserAge,
});
```

`ValidateVO.createVODefinition({...})` -> Este método se utiliza para crear una definición de mapeo de Value Objects. Debes pasar un objeto donde las claves son los nombres de las propiedades del modelo y los valores son las clases de los Value Objects correspondientes. Esto permite que el sistema conozca qué VO corresponde a cada propiedad del modelo.

`ValidateVO.createVODefinition({...})` Devolverá un objeto que contiene la definición de los VOs y la estructura con los tipos de datos que se utilizarán para validar las propiedades del modelo, conteniendo tanto los tipos primitivos (`.values`) y los tipos de VOs (`.VOs`) que has definido. Esto es crucial para que el sistema pueda genera automaticamente las interfaces y la validación multiple en caso de tener varios errores de validación en un mismo modelo a la vez.

Además, este objeto contiene el método `create(params)` que nos permitirá crear una instancia validada del modelo utilizando los VOs definidos para luego pasarlos por el constructor del modelo. Esto garantizará que todas las propiedades del modelo sean validadas correctamente antes de ser utilizadas.

<small>Recordar que este paso es totalmente interno y no corresponde necesariamente a una práctica regular o propia de la arquitectura hexagonal, sino que es una implementación propia de nuestro sistema para facilitar la creación y validación de VOs.</small>

## Creación de un Modelo

### Paso 1: Definir Interfaces del Modelo (Interno de nuestro Sistema)

<small>Ver [paso 4](#paso-4-crear-la-definición-del-mapper-del-vo-interno-de-nuestro-sistema) de Creación de Value Objects</small>

Para crear un Modelo, primero debes definir las interfaces que representarán las propiedades del modelo. Estas interfaces deben incluir tanto los tipos primitivos como los Value Objects que has creado anteriormente.

```typescript
// src/modules/users/domain/interfaces/IUser.ts
import { UserVOBuilder } from '../value-objects'; //Importamos la definición de VOs desde el indice de VOs (paso 5 de Creación de Value Objects)

export type UserValues = typeof UserVOBuilder.values;
// { id: string; name: string; age: number; }
export type UserVO = typeof UserVOBuilder.type;
// { id: UserId; name: UserName; age: UserAge; }
```

`typeof UserVOBuilder.values` -> Este tipo representa los valores primitivos de los VOs definidos en `UserVOBuilder`. Es útil para definir las propiedades del modelo que serán asignadas a los VOs.

`typeof UserVOBuilder.type` -> Este tipo representa los Value Objects correspondientes a las propiedades del modelo. Es útil para definir las propiedades del modelo que serán instancias de los VOs.

### Paso 2: Definir el Modelo

Para definir el Modelo, crea una clase que implemente las interfaces definidas anteriormente. Asegúrate de que la clase tenga un constructor que reciba los valores necesarios y los asigne a las propiedades correspondientes.

```typescript
// src/modules/users/domain/models/User.ts

// Asegurate de importar ambas interfaces
import { UserValues, UserVO } from '../interfaces/UserValues';
// Asegurate de importar la definición de VOs
import { UserVOBuilder } from '../valueObjects/UserVOBuilder';

export class User {
  constructor(
    // Para cada propiedad del modelo asigna el tipo correspondiente desde la Interface UserVO
    private readonly id: UserVO['id'],
    private name: UserVO['name'],
    private age: UserVO['age'],
  ) {}
}
```

### Paso 3: Crear el método estático `create`

Para facilitar la creación de instancias del Modelo, puedes agregar un método estático `create` que reciba un objeto con los valores necesarios y utilice la definición de VOs para crear una instancia validada del Modelo.

```typescript
// src/modules/users/domain/models/User.ts
import { UserValues, UserVO } from '../interfaces/UserValues';
import { UserVOBuilder } from '../valueObjects/UserVOBuilder';

export class User {
  constructor(
    private readonly id: UserVO['id'],
    private name: UserVO['name'],
    private age: UserVO['age'],
  ) {}

  static create(params: UserValues): User {
    // Utiliza el método create de UserVOBuilder para crear una instancia validada del modelo
    const data = UserVOBuilder.create(params);
    return new User(data.id, data.name, data.age);
  }
}
```

`create(params: UserValues): User` -> Este método estático recibe un objeto `params` que contiene los valores necesarios para crear una instancia del Modelo, recuerda que en este punto debes enviar la interfaz con los tipos de datos primitivos que deben contener estos params (`UserValues`).

Utiliza la definición de VOs para validar y crear una instancia de `UserVOBuilder.create(params)` entregandole los params que ya viene verificado su tipado. Esto permitará crear un objeto con todo los valores validados y creados debidamente con su correspondiente Value Object <small>(esto se logra por el mappeador, puedes ver el [paso 4](#paso-4-crear-la-definición-del-mapper-del-vo-interno-de-nuestro-sistema) de Creación de Value Objects o la documentación del sistema de [Validación](./validations.md))</small>

Finalmente asegurate de que el método retorne una nueva instancia del Modelo `return new User(data.id, data.name, data.age);` utilizando los valores validados y creados por el mapeador.

### Paso 4: Agrega métodos adicionales al Modelo

Puedes agregar métodos adicionales al Modelo para encapsular la lógica de negocio y los comportamientos asociados a la entidad. Por ejemplo, puedes agregar un método para actualizar el nombre del usuario:

```typescript
// src/modules/users/domain/models/User.ts
import { UserValues, UserVO } from '../interfaces/UserValues';
import { UserVOBuilder } from '../valueObjects/UserVOBuilder';

export class User {
  constructor(
    private readonly id: UserVO['id'],
    private name: UserVO['name'],
    private age: UserVO['age'],
  ) {}

  static create(params: UserValues): User {
    const data = UserVOBuilder.create(params);
    return new User(data.id, data.name, data.age);
  }

  getUserValues(): UserValues {
    return {
      id: this.id.value,
      name: this.name.value,
      age: this.age.value,
    };
  }
}
```

`getUserValues(): UserValues` -> Este método devuelve un objeto con los valores del usuario, utilizando las propiedades de los Value Objects. Esto es útil para obtener una representación del usuario sin exponer directamente los VOs.

Puedes agregar más métodos según sea necesario para encapsular la lógica de negocio y los comportamientos asociados a la entidad. Por ejemplo, podrías agregar un método para actualizar el nombre del usuario o para calcular la edad en años.

### Paso 5: Exportar el Modelo y los Value Objects (opcional-recomendado)

Finalmente, asegúrate de exportar el Modelo y los Value Objects desde sus respectivos archivos para que puedan ser utilizados en otras partes del sistema.

```typescript
// src/modules/users/domain/index.ts
export * from './interfaces/UserValues';
export * from './valueObjects/UserVOBuilder';
export * from './models/User';
```

Con esto, has creado un Value Object y un Modelo siguiendo la estructura de validación automatizada y abstraida. Ahora puedes utilizar estos componentes en tu sistema para representar y manipular entidades del dominio de manera consistente y segura.

## Conclusión

El sistema de creación de Value Objects y Modelos proporciona:

- **Estructura consistente** para la creación de VOs inmutables y Modelos con identidad
- **Validación automatizada** mediante decoradores categorizados y auto-indexados
- **Tipado fuerte** con interfaces generadas automáticamente desde mapeos de VOs
- **Separación clara** entre valores primitivos (`UserValues`) y objetos de dominio (`UserVO`)
- **Creación segura** con validación fail-fast en constructores individuales
- **Validación acumulativa** mediante `ValidateVO.create()` para mejor experiencia de usuario
- **Reutilización** de lógica de validación entre diferentes contextos del dominio
- **Mantenibilidad** a través de factory methods y métodos estáticos consistentes

Este enfoque garantiza la integridad de datos desde el dominio, facilita la evolución del sistema y proporciona una base sólida para el desarrollo de aplicaciones robustas siguiendo los principios de Domain-Driven Design.
