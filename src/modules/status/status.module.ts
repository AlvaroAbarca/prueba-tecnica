import { Module } from '@nestjs/common';
import { SharedModule } from '@modules/shared/shared.module';
import { ConfigModule } from '@nestjs/config';
import { StatusController } from './infrastructure/controllers/status.controller';
import { LogProvider } from '@modules/shared/domain/interface/logProvider.interface';
import { StatusUseCase } from './application/useCases/status.useCase';
import { StatusService } from '@modules/shared/infrastructure/services/status.service';
import { CheckConnection } from '@modules/shared/domain/interface/checkConnection.interface';
import { CheckConnectionImp } from '@modules/shared/infrastructure/persistences/checkConnection';

@Module({
  imports: [SharedModule, ConfigModule],
  controllers: [StatusController],
  providers: [
    StatusService,
    {
      provide: 'StatusUseCase',
      useFactory: (logger: LogProvider, statusService: StatusService, checkConnection: CheckConnection) => new StatusUseCase(logger, statusService, checkConnection),
      inject: [LogProvider, StatusService, CheckConnection],
    },
    {
      provide: StatusUseCase,
      useExisting: 'StatusUseCase',
    },
    {
      provide: CheckConnection,
      useClass: CheckConnectionImp,
    },
  ],
  exports: [StatusService],
})
export class StatusModule {}
