import { CheckConnection } from '@modules/shared/domain/interface/checkConnection.interface';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class CheckConnectionImp implements CheckConnection {
  constructor(@InjectDataSource('postgres') private readonly dataSource: DataSource) {}

  async isInitialized(): Promise<boolean> {
    try {
      return this.dataSource.isInitialized;
    } catch (err) {
      throw new Error(`Error checking database initialization: ${err.message}`);
    }
  }
}
