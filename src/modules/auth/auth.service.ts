import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '../user';
import {
  GenericResult,
  LoginResult,
  LoginUserDto,
  RegisterUserDto,
  User,
} from '../../domain';
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  async register(
    dto: RegisterUserDto,
  ): Promise<GenericResult<{ email: string; name: string; surname: string }>> {
    const user = await this.userService.findOne({
      where: { email: dto.email },
    });
    if (user) throw new ConflictException('User Already Exist');
    if (dto.password !== dto.repeatPassword)
      throw new BadRequestException('Passwords are not matched');
    delete dto.repeatPassword;
    try {
      const { email, name, surname } = await this.userService.create(
        plainToInstance(User, dto),
      );
      return {
        isSuccess: true,
        data: { email, name, surname },
      };
    } catch (error) {
      throw new InternalServerErrorException('Error while Create user');
    }
  }

  async login({ email, password }: LoginUserDto): Promise<LoginResult> {
    const user = await this.userService.findOne({ where: { email } });
    if (!user) throw new NotFoundException('User does not exist');
    const isSuccess = await compare(password, user.password);
    if (!isSuccess) throw new BadRequestException('Password is not correct');
    const token: string = sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        surname: user.surname,
        coins: user.coins,
      },
      this.configService.get('JWT_SECRET'),
      { expiresIn: '200h' },
    );
    return {
      access_token: token,
      user: {
        email: user.email,
        name: user.name,
        surname: user.surname,
        coins: user.coins,
      },
    };
  }
}
