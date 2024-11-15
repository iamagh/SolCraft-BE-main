import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserFriends } from '../entities/user-friends.entity';
import { User } from '../entities/user.entity';
import { BadRequest } from '../../../errors/BadRequest';

@Injectable()
export class UserFriendsService {
  constructor(
    @InjectRepository(UserFriends)
    private readonly userFriendsRepository: Repository<UserFriends>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async sendFriendRequest(
    user: User,
    friendEmail: string,
  ): Promise<UserFriends> {
    const friend = await this.userRepository.findOne({
      where: { email: friendEmail },
    });

    if (!friend) {
      throw new NotFoundException('Friend not found');
    }

    const requestExists = await this.userFriendsRepository.findOne({
      where: [
        {
          user: {
            id: user.id,
          },
        },
        {
          friend: {
            id: friend.id,
          },
        },
      ],
    });

    if (requestExists) {
      throw new BadRequest('Request already exists');
    }

    const friendRequest = this.userFriendsRepository.create({
      user,
      friend,
      isAccepted: false,
    });

    return this.userFriendsRepository.save(friendRequest);
  }

  async acceptFriendRequest(
    userId: string,
    requestId: string,
  ): Promise<UserFriends> {
    const friendRequest = await this.userFriendsRepository.findOne({
      where: { id: requestId, friend: { id: userId }, isAccepted: false },
      relations: ['user', 'friend'],
    });

    if (!friendRequest) {
      throw new NotFoundException('Friend request not found');
    }

    friendRequest.isAccepted = true;

    return this.userFriendsRepository.save(friendRequest);
  }

  async rejectFriendRequest(userId: string, requestId: string): Promise<void> {
    const friendRequest = await this.userFriendsRepository.findOne({
      where: { id: requestId, friend: { id: userId }, isAccepted: false },
    });

    if (!friendRequest) {
      throw new NotFoundException('Friend request not found');
    }

    await this.userFriendsRepository.remove(friendRequest);
  }

  async listFriends(userId: string): Promise<User[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['friends', 'friends.friend'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.friends
      .filter((friend) => friend.isAccepted)
      .map((friend) => friend.friend);
  }

  async listFriendRequests(userId: string): Promise<UserFriends[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['friendRequests', 'friendRequests.user'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.friendRequests.filter((request) => !request.isAccepted);
  }

  async listUserChats(userId: string): Promise<UserFriends[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['friendRequests', 'friendRequests.user'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.friendRequests.filter((request) => !request.isAccepted);
  }
}
