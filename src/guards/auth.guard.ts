import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core/services/reflector.service";


@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());

        if (!requiredRoles) {
            return true; // If no roles are required, allow access
        }

        const request = context.switchToHttp().getRequest();

        // Assuming the user is attached to the request object
        const user = request.user;

        if (!user || !user.roles || !requiredRoles.some(role => user.roles.includes(role))) {
            throw new ForbiddenException('You do not have permission to access this resource');
    }
        return true;
    }
}

