import { createLogger, format, Logger, transports } from 'winston';

export class LoggerConfig {
  createLogger(): Logger {
    const customFormat = format.printf((info: any) => {
      const { level, message, requestId } = info;
      return ` [${process.pid}] | ${info.timestamp} | ${requestId} | ${level} | ${message}`;
    });

    // Configuracion para Logs de consola
    const logger = createLogger({
      level: 'debug',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        format.colorize({
          all: true,
          colors: {
            error: 'red',
            warn: 'yellow',
            info: 'green',
            debug: 'cyan',
            verbose: 'cyan',
            silly: 'magenta',
          },
        }),
        customFormat,
      ),
      transports: [
        new transports.Console({
          format: format.combine(format.timestamp(), format.label(), format.json(), customFormat),
        }),
      ],
    });

    return logger;
  }
}
