import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuthUser } from '../domain/auth-user.interface';

@ApiTags('Identity & Auth')
@Controller('api/auth')
export class AuthController {
  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated employee identity and role' })
  async getMe(@CurrentUser() user: AuthUser): Promise<AuthUser> {
    return user;
  }
}
