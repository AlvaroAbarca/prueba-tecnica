import { VOMapping, VOValues } from '../../interfaces/voValidators.interfaces';
import { ValidateVO } from './validateVO';

export class VODefinitionFactory {
  static create<T extends Record<string, new (value: any) => any>>(mapping: T) {
    type InferredVOs = VOMapping<T>;
    type InferredValues = VOValues<InferredVOs>;

    return {
      mapping,
      create: (params: Record<keyof T, any>): InferredVOs => {
        return ValidateVO.createFromMapping<InferredVOs>(params as any, mapping);
      },
      type: {} as InferredVOs,
      values: {} as InferredValues,
    };
  }
}
