export abstract class AccessorEntity<T> {
  [key: string]: any;
  constructor(properties: T) {
    Object.assign(this, properties);
    this.generateAccessors();
  }

  getValues(): { [P in keyof T]: T[P] extends { value: any } ? T[P]['value'] : T[P] } {
    const result = {} as any;
    const properties = Object.keys(this);
    properties.forEach((property) => {
      if (typeof this[property] !== 'function') {
        const valueObj = this[property];
        result[property] = valueObj && typeof valueObj === 'object' && 'value' in valueObj ? valueObj.value : valueObj;
      }
    });
    return result;
  }

  private generateAccessors() {
    const properties = Object.keys(this);

    properties.forEach((property) => {
      if (typeof this[property] !== 'function') {
        const getterName = `get${property.charAt(0).toUpperCase() + property.slice(1)}`;
        const setterName = `set${property.charAt(0).toUpperCase() + property.slice(1)}`;

        if (typeof this[getterName] !== 'function') {
          this[getterName] = () => {
            const valueObj = this[property];
            return valueObj && typeof valueObj === 'object' && 'value' in valueObj ? valueObj.value : valueObj;
          };
        }

        if (typeof this[setterName] !== 'function') {
          this[setterName] = (value: any) => {
            this[property] = value;
          };
        }
      }
    });
  }
}
