import { Module } from '@nestjs/common';
import { MessengerService } from './messenger.service';
import { MessengerController } from './messenger.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessengerEntity } from './entities/messenger.entity';
import { BaseService } from '../base/base.service';

@Module({
  imports: [TypeOrmModule.forFeature([MessengerEntity])],
  providers: [MessengerService, BaseService],
  controllers: [MessengerController],
  exports: [MessengerService],
})
export class MessengerModule {}
