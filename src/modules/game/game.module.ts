import { GameService } from './game.service';
import { GameController } from './game.controller';
import { Module } from '@nestjs/common';
import { UserModule } from '../user';

@Module({
  imports: [UserModule],
  controllers: [GameController],
  providers: [GameService],
})
export class GameModule {}
