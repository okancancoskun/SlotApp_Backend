import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { LoginUserDto, RegisterUserDto } from '../../domain';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

jest.mock('../user');

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UserService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
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

  describe('login', () => {
    beforeEach(() => {
      mockConfigService.get.mockReturnValue('mocked_secret_key');
    });
    it('should user login', async () => {
      const password = faker.string.sample();
      const email = faker.internet.email();
      const loginUserDto: LoginUserDto = {
        email,
        password: password,
      };

      const mockUser = {
        id: faker.number.int(),
        email,
        password,
        name: faker.string.sample(),
        surname: faker.string.sample(),
        coins: 100,
      };

      userService.findOne = jest.fn().mockResolvedValueOnce(mockUser);
      const spiedBcryptHashMethod = jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));

      const result = await authService.login(loginUserDto);
      expect(spiedBcryptHashMethod).toHaveBeenCalled();
      expect(result).toEqual({
        access_token: expect.any(String),
        user: {
          email,
          name: mockUser.name,
          surname: mockUser.surname,
          coins: mockUser.coins,
        },
      });
      expect(userService.findOne).toHaveBeenCalledWith({
        where: { email },
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      userService.findOne = jest.fn().mockResolvedValueOnce(undefined);
      const loginUserDto = {
        email: faker.internet.email(),
        password: faker.string.sample(),
      };

      await expect(authService.login(loginUserDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
  it('should throw BadRequestException if password is not correct', async () => {
    const password = faker.string.sample();
    const email = faker.internet.email();
    const loginUserDto: LoginUserDto = {
      email,
      password: password,
    };

    const mockUser = {
      id: faker.number.int,
      email,
      password,
      name: faker.string.sample(),
      surname: faker.string.sample(),
      coins: 100,
    };

    userService.findOne = jest.fn().mockResolvedValueOnce(mockUser);
    const spiedBcryptHashMethod = jest
      .spyOn(bcrypt, 'compare')
      .mockImplementation(() => Promise.resolve(false));

    expect(spiedBcryptHashMethod).toHaveBeenCalled();
    await expect(authService.login(loginUserDto)).rejects.toThrow(
      BadRequestException,
    );
  });
});
