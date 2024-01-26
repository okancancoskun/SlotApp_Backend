import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserService } from '../user';
import gameData from '../../tools/json/gameData.json';
import {
  Game,
  GamePage,
  SpinResult,
  BET_AMOUNT,
  rewards,
  SLOT,
  reels,
  CurrentUser,
} from '../../domain';

@Injectable()
export class GameService {
  constructor(private readonly userService: UserService) {}

  public getAllGames(query?: string): Game[] {
    if (!query) return gameData;
    return gameData.filter((game) =>
      game.title.toLowerCase().includes(query.toLowerCase()),
    );
  }

  public getGame(slug: string): GamePage {
    return {
      initialSpin: this.getRandomResult(),
      game: gameData.find((game) => game.slug == slug),
    };
  }

  public async spinSlotMachine(currentUser: CurrentUser): Promise<SpinResult> {
    const user = await this.userService.findOne({
      where: { id: currentUser.id },
    });
    if (!user.coins)
      throw new BadRequestException("You don't have enough coin to spin");
    const result: SLOT[] = this.getRandomResult();
    let rewardType: string = '';
    let slotType: string = '';
    const max = result.every((item) => item === result[0]);
    if (max) {
      slotType = result[0];
      rewardType = 'max';
    } else if (!max) {
      const min = result.slice(0, 2).every((item) => item === result[0]);

      if (min) {
        slotType = result[0];
        rewardType = 'min';
      }
    }
    const reward: number = this.getReward(slotType, rewardType);
    const currentBalance: number = user.coins + reward - BET_AMOUNT;
    try {
      await this.userService.update({ id: user.id }, { coins: currentBalance });
    } catch (error) {
      throw new InternalServerErrorException(
        'An error happened while updating user coin',
      );
    }

    return {
      reward,
      result,
      currentBalance,
    };
  }

  private getReward(slot_type: string, reward_type: string): number {
    return rewards[`${slot_type}_${reward_type}`] || 0;
  }

  private getRandomResult(): SLOT[] {
    const result: SLOT[] = [];
    for (let i = 0; i < reels.length; i++) {
      const randomIndex = Math.floor(Math.random() * reels[i].length);
      result.push(reels[i][randomIndex]);
    }
    return result;
  }
}
