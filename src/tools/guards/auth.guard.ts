import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { verify } from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (request.headers.authorization) {
      const token = request.headers.authorization.split(' ')[1];
      try {
        const user = verify(token, process.env.JWT_SECRET);
        if (!user) return false;
        request.user = user;
        return true;
      } catch (error) {
        throw new HttpException('Token Not Valid', 401);
      }
    } else {
      throw new HttpException('Authorization header does not exist', 403);
    }
  }
}
