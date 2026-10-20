import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { SharedModule } from '@modules/shared/shared.module';
import { FlexibleAuthGuard } from '@modules/auth/infrastructure/guards/flexibleAuth.guard';
import { RequestIdMiddleware } from '@modules/shared/infrastructure/providers/log/idWinstonLogs';
import { CookieMiddleware } from '@modules/auth/infrastructure/middleware/cookie.middleware';
import { AuthModule } from '@modules/auth/auth.module';
import { StatusModule } from '@modules/status/status.module';
import { UsersModule } from '@modules/users/users.module';
import { RolesGuard } from '@modules/auth/infrastructure/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SharedModule,
    UsersModule,
    AuthModule,
    StatusModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useExisting: FlexibleAuthGuard,
    },
    {
      provide: APP_GUARD,
      useExisting: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware, CookieMiddleware).forRoutes('*');
  }
}
