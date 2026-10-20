export type VOMapping<T extends Record<string, new (value: any) => any>> = {
  [K in keyof T]: InstanceType<T[K]>;
};

type ExtractValue<T> = T extends { value: infer V } ? V : never;

export type VOValues<T extends Record<string, any>> = {
  [K in keyof T]: ExtractValue<T[K]>;
};
