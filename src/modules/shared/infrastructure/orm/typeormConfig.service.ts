import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import * as path from 'node:path';
import { types } from 'pg';

process.env.TZ = process.env.TZ || 'UTC';

types.setTypeParser(types.builtins.TIMESTAMP, (value: string) => {
  return new Date(value);
});
types.setTypeParser(types.builtins.TIMESTAMPTZ, (value: string) => {
  return new Date(value);
});

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const isCompiledCode = __filename.endsWith('.js');
    const migrationPath = isCompiledCode ? path.join(process.cwd(), 'dist', 'migrations', '*.js') : path.join(process.cwd(), 'migrations', '*.ts');

    return {
      type: 'postgres',
      host: this.configService.get<string>('BD_HOST'),
      port: Number(this.configService.get<string>('BD_PORT')),
      username: this.configService.get<string>('BD_USER'),
      password: this.configService.get<string>('BD_PASS'),
      database: this.configService.get<string>('BD_SCHEMA'),
      synchronize: false,
      entities: [path.resolve(__dirname + '/../entities/*.entity{.ts,.js}')],
      migrations: [migrationPath],
      extra: {
        max: Number(this.configService.get<string>('BD_MAX_CONNECTIONS')) || 20,
        min: 0,
        connectionTimeoutMillis: 15000,
        idleTimeoutMillis: 30000,
        allowExitOnIdle: false,
        keepAlive: true,
        keepAliveInitialDelayMillis: 5000,
        options: '-c timezone=UTC',
      },
      connectTimeoutMS: 15000,
    };
  }

  getDataSourceOptions(): DataSourceOptions {
    return this.createTypeOrmOptions() as DataSourceOptions;
  }
}
