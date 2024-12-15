import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  Redirect,
  Request,
  Res,
  SerializeOptions,
  UseGuards,
} from '@nestjs/common';
import axios from 'axios';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthUpdateDto } from './dto/auth-update.dto';
import { UserService } from '../user/services/user.service';
import { LoginProvider } from './auth.enum';
import { User } from '../user/entities/user.entity';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtAccessGuard } from './guards/jwt-access.guard';

@ApiTags('Auth')
@Controller({
  path: 'auth',
})
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  @SerializeOptions({
    groups: ['me'],
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async clientLogin(@Body() loginDTO: AuthLoginDto) {
    return this.authService.validateLogin(loginDTO, false);
  }

  @ApiBearerAuth()
  @Get('refresh-access')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.CREATED)
  async refreshAccessToken(@Request() { user }: { user: User }) {
    return this.authService.generateTokens(user, false);
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Get('me')
  @UseGuards(JwtAccessGuard)
  @HttpCode(HttpStatus.OK)
  public async me(@Request() { user }: { user: User }) {
    return this.authService.me(user.id);
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Patch('me')
  @UseGuards(JwtAccessGuard)
  @HttpCode(HttpStatus.OK)
  public async update(
    @Request() { user }: { user: User },
    @Body() userDto: AuthUpdateDto,
  ) {
    return this.authService.update(user.id, userDto);
  }

  @ApiBearerAuth()
  @Delete('me')
  @UseGuards(JwtAccessGuard)
  @HttpCode(HttpStatus.OK)
  public async delete(@Request() { user }: { user: User }) {
    return this.authService.delete(user.id);
  }

  @Get('google')
  @UseGuards(AuthGuard(LoginProvider.GOOGLE))
  googleLogin() {
    return HttpStatus.OK;
  }

  @Get('google/callback')
  @Redirect()
  @UseGuards(AuthGuard(LoginProvider.GOOGLE))
  async googleLoginCallback(@Request() { user }: { user: User }) {
    const url = this.authService.generateRedirectUrl(user);

    return { url };
  }

  @Get('facebook')
  @UseGuards(AuthGuard(LoginProvider.FACEBOOK))
  facebookLogin() {
    return HttpStatus.OK;
  }

  @Get('facebook/callback')
  @Redirect()
  @UseGuards(AuthGuard(LoginProvider.FACEBOOK))
  async facebookLoginCallback(@Request() { user }: { user: User }) {
    const url = this.authService.generateRedirectUrl(user);

    return { url };
  }

  @Get('microsoft')
  @UseGuards(AuthGuard('microsoft'))       // go to the microsoft strategy
  microsoftLogin() {
    return HttpStatus.OK;
  }

  @Get('logout')
  logout() {
    return HttpStatus.OK;
  }

  @Get('microsoft/callback')
  @Redirect()
  @UseGuards(AuthGuard('microsoft'))
  microsoftLoginCallback(@Request() { user }: { user: User }) {
    const url = this.authService.generateRedirectUrl(user);

    return { url };
  }

  @Get('minecraft')
  async login(@Res() res) {
    const microsoftLoginUrl = this.authService.getMicrosoftLoginUrl();

    return res.redirect(microsoftLoginUrl);
  }

  @Get('microsoft/callback2')
  async callback(@Query('code') code: string, @Res() res) {
    const tokenData = await this.authService.getMicrosoftToken(code);
    console.log('<<<<<tokenData>>>>>');
    console.log(tokenData);
    const minecraftProfile = await this.authService.getMinecraftProfile(
      tokenData.access_token,
    );

    console.log('<<<<<minecraftProfile>>>>>');
    console.log(minecraftProfile);

    // You now have the user's Minecraft profile and can proceed to issue a JWT token
    return res.json(minecraftProfile); // Return the Minecraft profile or continue the login flow
  }
}
