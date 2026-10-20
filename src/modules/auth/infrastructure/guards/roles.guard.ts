import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../../shared/infrastructure/decorators/rolesCan.decorator';
import { EmitResponse } from '../../../shared/infrastructure/dto/respuesta';
import { UserProfileAndRolesService } from '@modules/auth/application/services/userProfileAndRoles.service';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly userProfileAndRolesService: UserProfileAndRolesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    const type = context.getType();
    if (type !== 'http') return true;
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    this.logger.debug('Required Roles:', requiredRoles);

    if (!user?.account?.email) {
      throw new ForbiddenException('User not authenticated');
    }
    user.roles = await this.getUserRoles(user.account.email);
    try {
      const userRoles = user.roles;

      if (userRoles.length === 0) {
        throw new ForbiddenException('User has no assigned roles');
      }

      const hasRequiredRole = requiredRoles.some((requiredRole) => userRoles.includes(requiredRole));

      if (!hasRequiredRole) {
        this.logger.warn(`Access denied for ${user.account?.email}. Required roles: [${requiredRoles.join(', ')}]. User roles: [${userRoles.join(', ')}]`);
        EmitResponse.error('Access denied', [{ message: 'User does not have the required roles' }], 401);
      }

      this.logger.debug(`Access granted for user: ${user.account?.email}`);
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error('Error verifying user roles:', error);
      EmitResponse.error('Access denied', [{ message: 'User does not have the required roles' }], 401);
    }
  }

  private async getUserRoles(email: string): Promise<string[]> {
    return await this.userProfileAndRolesService.getUserRoles(email);
  }
}
