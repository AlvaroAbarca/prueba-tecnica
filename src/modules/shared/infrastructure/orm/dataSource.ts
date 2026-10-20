import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { TypeOrmConfigService } from './typeormConfig.service';
import { config } from 'dotenv';

config();
const configService = new ConfigService();
const typeOrmConfigService = new TypeOrmConfigService(configService);

export const AppDataSource = new DataSource(typeOrmConfigService.getDataSourceOptions());

export const initializeDataSource = async () => {
  try {
    await AppDataSource.initialize();
    globalThis.initialized = true;
  } catch (err) {
    globalThis.initialized = false;
    throw err;
  }
};
