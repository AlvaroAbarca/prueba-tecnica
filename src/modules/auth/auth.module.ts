import { Module } from '@nestjs/common';
import { SharedModule } from '@modules/shared/shared.module';
import { ConfigModule } from '@nestjs/config';
import { InternalLoginUseCase } from './application/useCases/internalLogin.useCase';
import { LoginController } from './infrastructure/controllers/login.controller';
import { JwtTokenService } from './infrastructure/services/jwtToken.service';
import { LoginService } from './application/services/login.service';
import { CookieAuthGuard } from './infrastructure/guards/cookieAuth.guard';
import { RefreshTokenUseCase } from './application/useCases/refreshToken.useCase';
import { FlexibleAuthGuard } from './infrastructure/guards/flexibleAuth.guard';
import { InternalLogoutUseCase } from './application/useCases/logout.useCase';
import { UsersModule } from '@modules/users/users.module';
import { UserProfileAndRolesService } from './application/services/userProfileAndRoles.service';
import { RolesGuard } from './infrastructure/guards/roles.guard';
import { LoginValidationService } from './application/services/loginValidation.service';

@Module({
  imports: [SharedModule, ConfigModule, UsersModule],
  controllers: [LoginController],
  providers: [
    JwtTokenService,
    CookieAuthGuard,
    FlexibleAuthGuard,
    UserProfileAndRolesService,
    LoginValidationService,
    InternalLoginUseCase,
    RefreshTokenUseCase,
    LoginService,
    InternalLogoutUseCase,
    RolesGuard,
  ],
  exports: [FlexibleAuthGuard, RolesGuard, JwtTokenService, LoginService],
})
export class AuthModule {}
