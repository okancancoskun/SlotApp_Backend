import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { GameService } from './game.service';
import { AuthGuard } from '../../tools/guards/auth.guard';
import { User } from '../../tools/decorators/user.decorator';
import { CurrentUser, Game, GamePage } from '../../domain';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get('all')
  public getAllGames(@Query('search') search?: string): Game[] {
    return this.gameService.getAllGames(search);
  }

  @UseGuards(AuthGuard)
  @Post('spin-machine')
  public async spinMachine(@User() user: CurrentUser) {
    return this.gameService.spinSlotMachine(user);
  }

  /*   @UseGuards(AuthGuard) */
  @Get(':slug')
  public getSpin(@Param('slug') slug: string): GamePage {
    return this.gameService.getGame(slug);
  }
}
