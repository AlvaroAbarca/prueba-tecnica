import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as bodyParser from 'body-parser';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { GlobalExceptionFilter } from '@modules/shared/infrastructure/filters/globalException.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DataSourceInitializer } from '@modules/shared/infrastructure/orm/dataSourceInitializer';
import { WinstonLoggerV2 } from '@modules/shared/infrastructure/providers/log/winston/winstonLoggerV2';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const configService = new ConfigService();
  const logger = new WinstonLoggerV2();
  const app = await NestFactory.create(AppModule, {
    logger,
    cors: false,
    bodyParser: false,
  });
  if (configService?.get<string>('NODE_ENV').toLowerCase() != 'production') {
    const config = new DocumentBuilder()
      .setTitle(configService.get<string>('PROJECT_NAME'))
      .setDescription(configService.get<string>('PROJECT_DESCRIPTION'))
      .setVersion(configService.get<string>('PROJECT_VERSION'))
      .setExternalDoc('Descargar JSON para Postman', 'swagger/json')
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('swagger', app, documentFactory, {
      jsonDocumentUrl: 'swagger/json',
      explorer: false,
      swaggerOptions: {
        defaueltModelsExpandDepth: 0,
      },
    });
  }

  //Configuraciones migration - Ejecutar solo si las migraciones están disponibles
  try {
    logger.debug('INI Migrations');
    await DataSourceInitializer.initializeAndRunMigrations();
    logger.debug('END Migrations');
  } catch (error) {
    logger.warn('Migration initialization skipped or failed: ' + error.message);
  }

  //Limitamos la cantidad de data que puede entrar
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  app.use(cookieParser.default());

  const data = configService.get<string>('CORS_ALLOW_ORIGIN')?.split(',') || ['http://localhost:3001'];
  app.enableCors({
    origin: data,
    methods: configService.get<string>('CORS_ALLOW_METHODS')?.split(',') || ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: configService.get<string>('CORS_ALLOW_HEADERS')?.split(',') || ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cookie'],
    credentials: true, // CRÍTICO: Habilitar cookies cross-origin
  });

  const isDevelopment = configService.get<string>('NODE_ENV')?.toLowerCase() !== 'production';

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: isDevelopment ? ["'self'", "'unsafe-inline'", "'unsafe-eval'"] : ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
          formAction: ["'self'"],
          upgradeInsecureRequests: [],
        },
      },
      // HSTS solo en producción
      hsts: isDevelopment
        ? false
        : {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
          },
      // Otros headers de seguridad
      frameguard: { action: 'deny' },
      noSniff: true,
      hidePoweredBy: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );

  // Headers adicionales personalizados
  app.use((req, res, next) => {
    // Asegurar que X-Content-Type-Options esté configurado
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // XSS Protection para navegadores antiguos
    res.setHeader('X-XSS-Protection', '1; mode=block');
    // Política de permisos restrictiva
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), fullscreen=(self)');
    next();
  });

  // 5. Configuración de Cookies Seguras
  app.use((req, res, next) => {
    // Interceptar el método setHeader para cookies
    const originalSetHeader = res.setHeader;
    res.setHeader = function (name: string, value: any) {
      if (name.toLowerCase() === 'set-cookie') {
        // Procesar cookies para añadir flags de seguridad
        let cookieValue = Array.isArray(value) ? value : [value];
        cookieValue = cookieValue.map((cookie: string) => {
          if (typeof cookie === 'string') {
            // Añadir HttpOnly si no existe
            if (!cookie.toLowerCase().includes('httponly')) {
              cookie += '; HttpOnly';
            }
            // Añadir Secure en producción
            if (!isDevelopment && !cookie.toLowerCase().includes('secure')) {
              cookie += '; Secure';
            }
            // Añadir SameSite si no existe
            if (!cookie.toLowerCase().includes('samesite')) {
              cookie += '; SameSite=Strict';
            }
            // Añadir Path si no existe
            if (!cookie.toLowerCase().includes('path')) {
              cookie += '; Path=/';
            }
          }
          return cookie;
        });
        value = Array.isArray(value) ? cookieValue : cookieValue[0];
      }
      return originalSetHeader.call(this, name, value);
    };

    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter(logger));

  //Iniciamos el proyecto
  await app.listen(configService.get<number>('PORT'));
  logger.info(`SERVICE STARTED ON PORT: ${configService.get<number>('PORT')}`);
}

bootstrap(); // NOSONAR - node 22 LTS supports top-level await, but we keep this for better error handling and logging.
