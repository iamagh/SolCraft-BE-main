import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleEnum } from './role.enum';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<number[]>('roles', [
      context.getClass(),
      context.getHandler(),
    ]);

    if (!roles?.length) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const roleName = request.user?.role?.name;

    return roles.includes(roleName) || roleName === RoleEnum.SUPER_ADMIN;
  }
}
