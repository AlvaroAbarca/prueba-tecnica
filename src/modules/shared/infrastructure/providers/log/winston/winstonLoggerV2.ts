import { Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { LoggerConfig } from './loggerConfig';
import { TransportManager } from './transportManager';
import { RequestContext } from './requestContext';
import { LogProvider } from '@modules/shared/domain/interface/logProvider.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WinstonLoggerV2 implements LogProvider {
  private readonly configService: ConfigService;
  private readonly logger: Logger;
  private readonly transportManager: TransportManager;
  private readonly requestContext: RequestContext;

  constructor() {
    const loggerConfig = new LoggerConfig();
    this.logger = loggerConfig.createLogger();
    this.transportManager = new TransportManager();
    this.requestContext = new RequestContext();
    this.configService = new ConfigService();

    const logEnabled = this.configService.get<string>('LOG_ENABLED');
    if (logEnabled === 'true') {
      const fileTransport = this.transportManager.createFileTransport();
      this.logger.add(fileTransport);
    }
  }

  private safeStringify(data: any): string {
    const seen = new WeakSet<object>();

    return JSON.stringify(data, (_key, value) => {
      if (value instanceof Error) {
        return {
          name: value.name,
          message: value.message,
          stack: value.stack,
        };
      }

      if (typeof value === 'bigint') {
        return value.toString();
      }

      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }

      return value;
    });
  }

  private logWithContext(level: string, mensaje: string, data: any = null) {
    const { requestId, service } = this.requestContext.getRequestContext();
    const serializedData = data !== null && data !== undefined ? this.safeStringify(data) : '';
    const _log = `${mensaje}${serializedData ? ' | ' + serializedData : ''}`;

    // convierte logs de info de nest a debug
    let finalLevel = level;
    if (level === 'info' && this.shouldConvertToDebug(mensaje)) {
      finalLevel = 'debug';
    }

    this.logger.log(finalLevel, _log, { requestId, service });
  }

  private shouldConvertToDebug(mensaje: string): boolean {
    const nestJsInfoMessages = [
      'Starting Nest application',
      'dependencies initialized',
      'Mapped {',
      'route',
      'Nest application successfully started',
      'RoutesResolver',
      'RouterExplorer',
      'Controller {',
    ];

    return nestJsInfoMessages.some((pattern) => mensaje.includes(pattern));
  }

  log(mensaje: string, data: any = null) {
    this.logWithContext('info', mensaje, data);
  }

  info(mensaje: string, data: any = null) {
    this.logWithContext('info', mensaje, data);
  }

  error(mensaje: string, data: any = null) {
    this.logWithContext('error', mensaje, data);
  }

  debug(mensaje: string, data: any = null) {
    this.logWithContext('debug', mensaje, data);
  }

  warn(mensaje: string, data: any = null) {
    this.logWithContext('warn', mensaje, data);
  }

  verbose(mensaje: string, data: any = null) {
    this.logWithContext('verbose', mensaje, data);
  }
}
