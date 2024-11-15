import { Injectable } from '@nestjs/common';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { InjectRepository } from '@nestjs/typeorm';
import { MessengerEntity } from './entities/messenger.entity';
import { MessageEntity } from './entities/message.entity';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';

@Injectable()
export class MessengerService {
  private connection: Connection;

  constructor(
    @InjectRepository(MessengerEntity)
    private readonly messengerRepository: Repository<MessengerEntity>,
    private readonly messageRepository: Repository<MessageEntity>,
    private readonly userRepository: Repository<User>,
  ) {
    this.connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  }

  async sendMessage(
    user: User,
    content: string,
    messengerId: string = null,
    friendId: string = null,
  ) {
    if (!content || (!messengerId && !friendId)) return false;

    let messenger;

    if (friendId) {
      const user2 = await this.userRepository.findOne({
        where: {
          id: friendId,
        },
      });

      messenger = await this.messengerRepository.create({
        user1: user,
        user2,
      });
    } else {
      messenger = await this.messengerRepository.findOne({
        where: {
          id: messengerId,
        },
      });
    }

    return await this.messageRepository.create({
      content,
      user,
      messenger,
    });
  }

  async editMessage(newContent: string, messageId: any) {
    const existingMessage = await this.messageRepository.findOne({
      where: {
        id: messageId,
      },
    });

    Object.assign(existingMessage, {
      content: newContent,
      editedMessages: [
        ...(existingMessage.editedMessages || []),
        existingMessage.content,
      ],
    });

    return this.messageRepository.save(existingMessage);
  }

  async makeMessagesSeen(messengerId: string) {
    const messenger = await this.messengerRepository.findOne({
      where: {
        id: messengerId,
      },
    });

    const messages = await this.messageRepository.find({
      where: {
        messenger,
      },
    });

    for (const message of messages) {
      Object.assign(message, { seen: true });
      await this.messageRepository.save(message);
    }

    return true;
  }

  async getAllByUserId(userId: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const messengers = await this.messengerRepository.find({
      where: [
        {
          user1: {
            id: user.id,
          },
        },
        {
          user2: {
            id: user.id,
          },
        },
      ],
    });

    return messengers;
  }

  async getUnreadMessengers(userId: string) {
    const unreadMessengers = await this.messengerRepository
      .createQueryBuilder('messenger')
      .leftJoinAndSelect('messenger.messages', 'messages')
      .leftJoinAndSelect('messenger.user1', 'user1')
      .leftJoinAndSelect('messenger.user2', 'user2')
      .where('(messenger.user1Id = :userId OR messenger.user2Id = :userId)', {
        userId,
      })
      .andWhere('messages.seen = false')
      .orderBy('messages.createdAt', 'DESC')
      .getMany();

    const mappedMessegers = [];

    for (const um of unreadMessengers) {
      let user1, user2;
      if (um.user1.id === userId) {
        user1 = um.user1;
        user2 = um.user2;
      } else {
        user1 = um.user2;
        user2 = um.user1;
      }

      mappedMessegers.push({
        user: {
          id: user1.id,
          name: `${user1.firstName} ${user1.lastName}`,
        },
        friend: {
          id: user2.id,
          name: `${user2.firstName} ${user2.lastName}`,
        },
        chatlog: um.messages.map((message) => {
          return {
            id: message.id,
            text: message.content,
            time: message.createdAt,
            sender: message.user,
          };
        }),
      });
    }

    return mappedMessegers;
  }

  async getMessagesByMessengerId(messengerId: string) {
    const messenger = await this.messengerRepository.findOne({
      where: {
        id: messengerId,
      },
      relations: ['messages'],
    });

    return messenger.messages;
  }
}
