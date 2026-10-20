import { LogProvider } from '@modules/shared/domain/interface/logProvider.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LogProviderMock implements LogProvider {
  info(): void {
    // Método mock
  }
  log(): void {
    // Método mock
  }
  warn(): void {
    // Método mock
  }
  error(): void {
    // Método mock
  }
  debug(): void {
    // Método mock
  }
  verbose(): void {
    // Método mock
  }
}
