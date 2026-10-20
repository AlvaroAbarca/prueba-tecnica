import { Injectable } from '@nestjs/common';
import { LogProvider } from '@modules/shared/domain/interface/logProvider.interface';
import { StatusService } from '@modules/shared/infrastructure/services/status.service';
import { CheckConnection } from '@modules/shared/domain/interface/checkConnection.interface';

@Injectable()
export class StatusUseCase {
  constructor(
    private readonly logger: LogProvider,
    private readonly statusService: StatusService,
    private readonly checkConnection: CheckConnection,
  ) {}

  async start(): Promise<any> {
    try {
      this.logger.debug(`INI | status.use-case.ts }`, this.constructor.name);
      const statusBD = await this.checkConnection.isInitialized();
      const statusResp = await this.statusService.getStatusService(statusBD);
      this.logger.info(`STATUS OK | status.use-case.ts`, this.constructor.name);
      this.logger.debug('END | status.use-case.ts', this.constructor.name);
      return statusResp;
    } catch (error) {
      this.logger.error(`ERROR | status.use-case.ts error=${JSON.stringify(error)}`, this.constructor.name);
      throw error;
    }
  }
}
