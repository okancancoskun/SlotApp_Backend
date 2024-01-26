import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { RegisterUserDto } from 'src/domain';
import { faker } from '@faker-js/faker';

jest.mock('../user');

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, UserService, ConfigService],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const password = faker.string.sample();
      const email = faker.internet.email();
      const name = faker.string.sample();
      const surname = faker.string.sample();
      const registerDto: RegisterUserDto = {
        email,
        password: password,
        repeatPassword: password,
        name,
        surname,
      };

      userService.findOne = jest.fn().mockResolvedValueOnce(null);

      userService.create = jest.fn().mockResolvedValueOnce({
        email,
        name,
        surname,
      });

      const result = await authService.register(registerDto);

      expect(result).toEqual({
        isSuccess: true,
        data: {
          email,
          name,
          surname,
        },
      });
      expect(userService.findOne).toHaveBeenCalledWith({
        where: { email },
      });
      expect(userService.create).toHaveBeenCalledWith(registerDto);
    });

    it('should throw ConflictException if user already exists', async () => {
      const password = faker.string.sample();
      const email = faker.internet.email();
      const name = faker.string.sample();
      const surname = faker.string.sample();
      const registerDto: RegisterUserDto = {
        email,
        password: password,
        repeatPassword: password,
        name,
        surname,
      };
      userService.findOne = jest.fn().mockResolvedValueOnce({ email });

      await expect(authService.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(userService.findOne).toHaveBeenCalledWith({
        where: { email },
      });
      expect(userService.create).not.toHaveBeenCalled(); // createUser should not be called
    });

    it('should throw BadRequestException if passwords are not matched', async () => {
      const password = faker.string.sample(8);
      const repeatPassword = faker.string.sample(10);
      const email = faker.internet.email();
      const name = faker.string.sample();
      const surname = faker.string.sample();
      const registerDto: RegisterUserDto = {
        email,
        password,
        repeatPassword,
        name,
        surname,
      };
      userService.findOne = jest.fn().mockResolvedValueOnce(null);

      await expect(authService.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(userService.findOne).toHaveBeenCalledWith({
        where: { email },
      });
      expect(userService.create).not.toHaveBeenCalled();
    });
  });
});
