import { Module, OnModuleInit } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import databaseConfig from './config/database.config';
import authConfig from './config/auth.config';
import appConfig from './config/app.config';
import microsoftConfig from './config/microsoft.config';
import solanaConfig from './config/solana.config';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { InternalServerError } from './errors/InternalServerError';
import { RoleModule } from './modules/role/role.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { TopCoinsModule } from './modules/top-coins/top-coins.module';
import { UserSeedModule } from './database/seeds/user/user-seed.module';
import { RoleSeedModule } from './database/seeds/role/role-seed.module';
import { RoleSeedService } from './database/seeds/role/role-seed.service';
import { UserSeedService } from './database/seeds/user/user-seed.service';
import { MinecraftModule } from './modules/minecraft/minecraft.module';
// import { TransactionModule } from './modules/transaction/transaction.module';
import { SocketModule } from './modules/socket/socket.module';

// import { ChatModule } from './modules/socket/socket.module';
// import { SocketModule } from './modules/socket/socket.module';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        authConfig,
        appConfig,
        microsoftConfig,
        solanaConfig,
      ],
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options) => {
        if (!options) {
          throw new InternalServerError('Invalid options passed');
        }
        return await new DataSource(options).initialize();
      },
    }),
    JwtModule,
    UserModule,
    UserSeedModule,
    RoleSeedModule,
    AuthModule,
    RoleModule,
    WalletModule,
    TopCoinsModule,
    MinecraftModule,
    SocketModule,
  ],
  providers: [
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: TransformResponseInterceptor,
    // },
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
  ],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly roleSeedService: RoleSeedService,
    private readonly userSeedService: UserSeedService,
  ) {}

  async onModuleInit() {
    await this.roleSeedService.run();
    await this.userSeedService.run();
  }
}


