import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../../tools/guards/auth.guard';
import { User } from '../../tools/decorators/user.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get('/me')
  public async getProfile(@User('id') id: number) {
    return this.userService.findOne({
      where: { id },
      select: ['coins', 'email', 'name', 'surname'],
    });
  }
}
