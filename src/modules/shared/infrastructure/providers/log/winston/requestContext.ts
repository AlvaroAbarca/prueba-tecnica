import { asyncLocalStorage } from '../idWinstonLogs';
import { ConfigService } from '@nestjs/config';

export class RequestContext {
  private readonly configService: ConfigService = new ConfigService();

  getRequestContext() {
    const store = asyncLocalStorage.getStore();
    const nodeEnv = this.configService.get<string>('NODE_ENV') ?? 'NODE_ENV=UNDEFINED';
    const service = this.configService.get<string>('LOKI_SERVICE') ? this.configService.get<string>('LOKI_SERVICE') + '-' + nodeEnv : 'sin servicio';

    if (store) {
      return {
        requestId: store?.get('requestId'),
        service,
      };
    }
    return { requestId: '---------', service };
  }
}
