import { format, transports } from 'winston';
import { ConfigService } from '@nestjs/config';
import { FileTransportInstance } from 'winston/lib/winston/transports';
import { todayDateString } from '@modules/shared/infrastructure/utils/date.helper';

export class TransportManager {
  private readonly configService: ConfigService = new ConfigService();
  private currentLogDate: string = todayDateString();
  private fileTransport: FileTransportInstance;

  createFileTransport(): FileTransportInstance {
    const logDirectory = this.configService.get<string>('LOG_DIR') ?? 'logs';
    const logFile = `${logDirectory}/log_${this.currentLogDate}.log`;
    const level = this.configService.get<string>('LOG_LEVEL') ?? 'debug';

    return new transports.File({
      filename: logFile,
      level,
      format: format.combine(format.timestamp(), format.json()),
      dirname: logDirectory,
    });
  }

  updateFileTransport(logger: any): void {
    const currentDate = todayDateString();
    if (currentDate !== this.currentLogDate) {
      this.currentLogDate = currentDate;
      if (this.fileTransport) {
        logger.remove(this.fileTransport);
      }
      this.fileTransport = this.createFileTransport();
      logger.add(this.fileTransport);
    }
  }
}
