import { AccessorEntity } from '@modules/shared/domain/models/accesorEntity';

class SampleAccessorEntity extends AccessorEntity<{ name: { value: string }; age: number; active: boolean }> {}

describe('AccessorEntity', () => {
  it('creates accessors and unwraps value objects', () => {
    const entity = new SampleAccessorEntity({
      name: { value: 'Alice' },
      age: 30,
      active: true,
    });

    expect(entity.getName()).toBe('Alice');
    expect(entity.getAge()).toBe(30);
    expect(entity.getActive()).toBe(true);
    expect(entity.getValues()).toEqual({
      name: 'Alice',
      age: 30,
      active: true,
    });

    entity.setName({ value: 'Bob' });
    entity.setAge(35);
    entity.setActive(false);

    expect(entity.getValues()).toEqual({
      name: 'Bob',
      age: 35,
      active: false,
    });
  });
});
