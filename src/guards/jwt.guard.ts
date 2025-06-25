import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../guards/custom.guard'

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private jwtService: JwtService, private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
    context.getHandler(),
    context.getClass(),
    ]);
    if (isPublic) return true;


    const request = context.switchToHttp().getRequest();
    const token = request.signedCookies?.jwt;

    if (!token) throw new UnauthorizedException('Token missing or invalid');

    try {
      const payload = this.jwtService.verify(token);
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
