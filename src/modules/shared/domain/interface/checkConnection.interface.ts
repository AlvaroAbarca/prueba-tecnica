export abstract class CheckConnection {
  abstract isInitialized(): Promise<boolean>;
}
