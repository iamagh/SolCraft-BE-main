import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PLAYER_VALIDATION_KEY } from '../decorators/player-validation.decorator';
import { UserService } from '../../user/services/user.service';

@Injectable()
export class PlayerValidationGuard implements CanActivate {
  constructor(private reflector: Reflector, private userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPlayerValidationRequired = this.reflector.get<boolean>(
      PLAYER_VALIDATION_KEY,
      context.getHandler(),
    );

    if (!isPlayerValidationRequired) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const playerId = request.headers['pid'];

    if (!playerId) {
      throw new UnauthorizedException('Player ID is required');
    }

    const player = await this.userService.findByMinecraftId(playerId);
    if (!player) {
      throw new UnauthorizedException('Invalid player ID');
    }

    return true;
  }
}
