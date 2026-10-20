export abstract class LogProvider {
  abstract info(message: string, ...params: any[]): void;
  abstract log(message: string, ...params: any[]): void;
  abstract warn(message: string, ...params: any[]): void;
  abstract error(message: string, ...params: any[]): void;
  abstract debug(message: string, ...params: any[]): void;
  abstract verbose(message: string, ...params: any[]): void;
}
