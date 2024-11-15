import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { LoginProvider } from '../auth.enum';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      authorizationURL: configService.get('microsoft.authorizationURL'),
      tokenURL: configService.get('microsoft.tokenURL'),
      clientID: configService.get('microsoft.clientId'),
      callbackURL: configService.get('microsoft.callbackUri'),
      scope: ['openid', 'profile', 'email', 'user.read', 'offline_access'],
    });
  }

  async validate(
    accessToken: string,
    _: string,
    __: any,
    done: (err: Error, user: any) => any,
  ) {
    const userInfo = await this.getUserInfo(accessToken);
    try {
      return this.authService.validateOAuthLogin(
        {
          id: userInfo.id,
          name: {
            givenName: userInfo.givenName,
            familyName: userInfo.surname,
          },
          emails: [
            {
              value: userInfo.mail,
            },
          ],
        },
        LoginProvider.MICROSOFT,
      );
    } catch (err) {
      done(err, false);
    }
  }

  async getUserInfo(accessToken) {
    const { data } = await axios.get(
      `${this.configService.get('microsoft.graphUrl')}/me`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return data;
  }
}
