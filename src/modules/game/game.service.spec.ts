import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user';
import { GameService } from './game.service';
import { CurrentUser, SpinResult, SLOT, rewards, User } from '../../domain';
import { faker } from '@faker-js/faker';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';

describe('GameService', () => {
  let gameService: GameService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameService,
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    gameService = module.get<GameService>(GameService);
    userService = module.get<UserService>(UserService);
  });

  describe('spinSlotMachine', () => {
    it('should spin slot machine successfully and update user balance', async () => {
      const currentUser: CurrentUser = {
        id: faker.number.int(),
        email: faker.internet.email(),
        name: faker.string.sample(),
        surname: faker.string.sample(),
      };

      userService.findOne = jest
        .fn()
        .mockResolvedValueOnce({ ...currentUser, coins: 100 });
      userService.update = jest.fn().mockImplementationOnce(async () => {
        return { raw: [], generatedMaps: [], affected: 1 };
      });

      const result: SpinResult = await gameService.spinSlotMachine(currentUser);

      expect(result).toEqual({
        reward: expect.any(Number),
        result: expect.any(Array<String>),
        currentBalance: expect.any(Number),
      });

      expect(userService.findOne).toHaveBeenCalledWith({
        where: { id: currentUser.id },
      });
      expect(userService.update).toHaveBeenCalledWith(
        { id: currentUser.id },
        { coins: expect.any(Number) },
      );
    });

    it('should throw BadRequestException if user does not have enough coins', async () => {
      const currentUser: CurrentUser = {
        id: faker.number.int(),
        email: faker.internet.email(),
        name: faker.string.sample(),
        surname: faker.string.sample(),
      };

      userService.findOne = jest
        .fn()
        .mockResolvedValueOnce({ ...currentUser, coins: 0 });

      await expect(gameService.spinSlotMachine(currentUser)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
