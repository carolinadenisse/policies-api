import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { LoginResponseDto } from './dto/login-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Autenticar y obtener token JWT' })
  @ApiBody({ type: LoginDto, description: 'Credenciales de acceso' })
  @ApiOkResponse({
    type: LoginResponseDto,
    description: 'Token de acceso generado',
  })
  async login(@Body() dto: LoginDto) {
    const user = await this.auth.validateUser(dto.email, dto.password);
    return this.auth.login(user);
  }
}
