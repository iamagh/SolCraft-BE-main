import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOneOptions, Repository } from 'typeorm';
import { EntityCondition } from '../../../utils/types/entity-condition.type';
import { UpdateUserDto } from '../dto/update-user.dto';
import { NotFound } from '../../../errors/NotFound';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';
import { LoginProvider } from '../../auth/auth.enum';
import { Unauthorized } from '../../../errors/Unauthorized';
import { Base } from '../../base/base.entity';
import { BaseService } from '../../base/base.service';
import { JwtPayload } from '../../auth/auth.types';
import { Forbidden } from '../../../errors/Forbidden';
import { UserFavoriteCoin } from '../entities/user-favorite-coin.entity';
import { RoleService } from '../../role/role.service';
import { RoleEnum } from '../../role/role.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserFavoriteCoin)
    private readonly userFavoriteCoinRepository: Repository<UserFavoriteCoin>,
    private readonly roleService: RoleService,
    private readonly entityManager: EntityManager,
    private readonly baseService: BaseService,
  ) {}

  async createOAuthUser(provider: LoginProvider, profile: any): Promise<User> {
    Base._currentUserId = null; // clear currentUserId

    const identifier = `${provider}-${profile.id}`;

    const role = await this.roleService.getRole({ name: RoleEnum.CLIENT });

    const newUserObj = {
      firstName: profile.name?.givenName,
      lastName: profile.name?.familyName,
      email: profile.emails?.[0]?.value,
      username: profile.emails?.[0]?.value || `@user-${Date.now()}`,
      identifier,
      role,
    };

    let user: User;
    await this.entityManager.transaction(async (transactionalEntityManager) => {
      user = transactionalEntityManager.create(User, newUserObj);
      await transactionalEntityManager.save(User, user);
    });

    return this.getUser({
      where: { id: user.id },
      relations: ['role'],
    });
  }

  count(where: EntityCondition<User>): Promise<number> {
    return this.userRepository.count({ where });
  }

  async listClients(query: any): Promise<{ result: Base[]; count: number }> {
    return this.baseService.queryEntity(this.userRepository, query);
  }

  async listAdmins(query: any): Promise<{ result: Base[]; count: number }> {
    // query.rolesToExclude = [RoleEnum.SUPER_ADMIN, RoleEnum.CLIENT];
    return this.baseService.queryEntity(this.userRepository, query);
  }

  async getUser(options: FindOneOptions<User>): Promise<User> {
    return this.userRepository.findOne(options);
  }

  async getUserBy(where: EntityCondition<User>): Promise<User> {
    const result = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.createdBy', 'createdBy')
      .leftJoinAndSelect('user.updatedBy', 'updatedBy')
      .leftJoin('user.role', 'role')
      .addSelect([
        'createdBy.id',
        'createdBy.firstName',
        'createdBy.lastName',
        'updatedBy.id',
        'updatedBy.firstName',
        'updatedBy.lastName',
      ])
      .where(where)
      .getOne();
    if (!result) {
      throw new NotFound('user_not_found');
    }
    return result;
  }

  async getUserLoginInfo(where: EntityCondition<User>): Promise<User> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .where(where)
      .select([
        'user.id',
        'user.password',
        'user.firstName',
        'user.lastName',
        'user.blockedAt',
        'role.id',
        'role.name',
      ])
      .getOne();
    if (!user) {
      throw new NotFound('user_not_found');
    }
    if (user.blockedAt) {
      throw new Unauthorized('user_blocked');
    }
    return user;
  }

  async create(createDto: CreateUserDto): Promise<User> {
    let user: User;
    await this.entityManager.transaction(async (transactionalEntityManager) => {
      user = transactionalEntityManager.create(User, createDto);
      await transactionalEntityManager.save(User, user);
    });

    return this.userRepository.findOneBy({ id: user.id });
  }

  async update(id: User['id'], updateProfileDto: UpdateUserDto) {
    const existingUser: User = await this.getUserBy({ id });

    Object.assign(existingUser, updateProfileDto);

    return this.userRepository.save(existingUser);
  }

  async delete(id: User['id']): Promise<User> {
    const user = await this.getUserBy({ id });
    return this.userRepository.softRemove(user);
  }

  async validateUserByToken(payload: JwtPayload): Promise<User> {
    if (!payload.id) {
      throw new Forbidden('invalid_token_payload');
    }
    const user = await this.getUser({
      where: { id: payload.id },
      relations: ['role'],
    });
    if (!user) {
      throw new NotFound('user_not_found');
    }
    if (user.blockedAt) {
      throw new Unauthorized('user_blocked');
    }

    Base._currentUserId = payload.id; // Set the current user's ID for updatedBy and createdBy

    return user;
  }

  async addUserFavoriteCoin(
    userId: string,
    symbol: string,
    name: string,
  ): Promise<UserFavoriteCoin> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFound('User not found');
    }

    const favoriteCoin = this.userFavoriteCoinRepository.create({
      user,
      symbol,
      name,
    });
    return this.userFavoriteCoinRepository.save(favoriteCoin);
  }

  async getUserFavoriteCoins(userId: string): Promise<UserFavoriteCoin[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favoriteCoins'],
    });

    if (!user) {
      throw new NotFound('User not found');
    }

    return user.favoriteCoins;
  }

  async findByMinecraftId(minecraftId: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { minecraftId } });
  }
}
