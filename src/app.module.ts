import { GameModule } from './modules/game/game.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './domain';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: `.env` }),
    GameModule,
    AuthModule,
    UserModule,
    /* TypeOrmModule.forRoot({
      type: 'postgres',
      username: 'iwwcracb',
      password: 'pTL9TQ67CgYeB_JnVzQenxqMgdrbU5AK',
      url: 'postgres://iwwcracb:pTL9TQ67CgYeB_JnVzQenxqMgdrbU5AK@manny.db.elephantsql.com/iwwcracb',
      database: 'Slot_App',
      entities: [User],
      synchronize: true,
    }), */
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        url: configService.get<string>('DB_URL'),
        database: configService.get<string>('DB_NAME'),
        entities: [User],
        synchronize: true,
        port: configService.get<number>('DB_PORT'),
        ssl: true,
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
