import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { LogProvider } from './domain/interface/logProvider.interface';
import { CheckConnection } from './domain/interface/checkConnection.interface';
import { CipherService } from './domain/interface/cipherService.interface';

import { TypeOrmConfigService } from './infrastructure/orm/typeormConfig.service';
import { CheckConnectionImp } from './infrastructure/persistences/checkConnection';
import { WinstonLoggerV2 } from './infrastructure/providers/log/winston/winstonLoggerV2';
import { QueryBuilderService } from './infrastructure/services/queryBuilder.service';
import { CipherServiceManagement } from './infrastructure/services/cipher.service';
import { ResponsesInterceptor } from './infrastructure/interceptors/responses.interceptor';

import { TransactionManager } from './domain/interface/transactionManager.interface';
import { TransactionManagerDB } from './infrastructure/persistences/transactionManagerDB';

const LoggerProvider = {
  inject: [ConfigService],
  provide: LogProvider,
  useFactory: async () => {
    return new WinstonLoggerV2();
  },
};

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmConfigService,
      name: 'postgres',
    }),
  ],
  controllers: [],
  providers: [
    TypeOrmConfigService,
    {
      provide: CheckConnection,
      useClass: CheckConnectionImp,
    },
    LoggerProvider,
    QueryBuilderService,
    {
      provide: CipherService,
      useClass: CipherServiceManagement,
    },
    {
      provide: TransactionManager,
      useClass: TransactionManagerDB,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponsesInterceptor,
    },
  ],
  exports: [LogProvider, TypeOrmConfigService, QueryBuilderService, TransactionManager, { provide: CipherService, useClass: CipherServiceManagement }],
})
export class SharedModule {}
