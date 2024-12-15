import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { EntityManager } from 'typeorm';

import { User } from 'src/modules/user/entities/user.entity';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthUpdateDto } from './dto/auth-update.dto';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { UserService } from 'src/modules/user/services/user.service';
import { UnprocessableEntity } from 'src/errors/UnprocessableEntity';
import { Unauthorized } from 'src/errors/Unauthorized';
import { UserVerifyBy } from '../user/user.enum';
import { LoginProvider } from './auth.enum';
import { JwtPayload } from './auth.types';
import { BadRequest } from '../../errors/BadRequest';
import { InternalServerError } from '../../errors/InternalServerError';
import { Base } from '../base/base.entity';
import { firstValueFrom } from 'rxjs';
import * as XboxLiveAuth from '@xboxreplay/xboxlive-auth';
import * as msal from '@azure/msal-node';
import * as prettyMilliseconds from 'pretty-ms';
import axios from 'axios';

const XSTSRelyingParty = 'rp://api.minecraftservices.com/';
const URL_LOGIN_XBOX =
  'https://api.minecraftservices.com/authentication/login_with_xbox';
const URL_MC_PROFILE = 'https://api.minecraftservices.com/minecraft/profile';
const USER_AGENT = 'starburn/minecraft-auth-test';
const scopes = ['XboxLive.signin', 'offline_access'];

@Injectable()
export class AuthService {
  private pca: msal.PublicClientApplication;

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly entityManager: EntityManager,
    private readonly httpService: HttpService,
  ) {
    this.pca = new msal.PublicClientApplication({
      auth: {
        clientId: this.configService.get('microsoft.clientId'),
        authority: 'https://login.microsoftonline.com/consumers',
      },
    });
  }

  async validateLogin(
    loginDto: AuthLoginDto,
    isAdmin: boolean,
  ): Promise<{
    accessToken: string;
    refreshToken?: string;
    firstName: User['firstName'];
    lastName: User['lastName'];
  }> {
    Base._currentUserId = null; // clear currentUserId

    const user = await this.userService.getUserLoginInfo({
      username: loginDto.username,
    });

    const isValidPassword = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isValidPassword) {
      throw new BadRequest('incorrect_password');
    }

    const { accessToken, refreshToken } = this.generateTokens(
      user,
      loginDto.rememberMe,
    );

    return {
      accessToken,
      refreshToken,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  generateRedirectUrl(user: User): string {
    const { accessToken } = this.generateTokens(user, false);

    const loginRedirectUrl = this.configService.get<string>(
      'auth.loginRedirectUrl',
    );
    return `${loginRedirectUrl}?token=${accessToken}`;
  }

  generateTokens(user: User, withRefreshToken: boolean) {
    const accessTokenOptions = {
      secret: this.configService.get<string>('auth.accessSecret'),
      expiresIn: this.configService.get<string>('auth.accessExpires'),
    };

    const payload: JwtPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload, accessTokenOptions);

    let refreshToken: string;
    if (withRefreshToken) {
      const refreshTokenOptions = {
        secret: this.configService.get<string>('auth.refreshSecret'),
        expiresIn: this.configService.get<string>('auth.refreshExpires'),
      };

      refreshToken = this.jwtService.sign(payload, refreshTokenOptions);
    }

    return { accessToken, refreshToken };
  }

  async register(dto: AuthRegisterDto): Promise<User> {
    const verifyBy = !dto.phone ? UserVerifyBy.EMAIL : UserVerifyBy.PHONE;

    if (!dto.username) {
      dto.username = dto.email;
    }

    let user: User;
    await this.entityManager.transaction(async (transactionalEntityManager) => {
      user = transactionalEntityManager.create(User, dto);
      await transactionalEntityManager.save(User, user);
    });

    return this.userService.getUser({
      where: { id: user.id },
      relations: ['userVerify'],
    });
  }

  async me(id: User['id']): Promise<User> {
    return this.userService.getUser({
      where: { id },
      select: ['id', 'firstName', 'lastName', 'email', 'username'],
    });
  }

  async update(id: User['id'], userDto: AuthUpdateDto): Promise<User> {
    await this.userService.update(id, userDto);

    return this.userService.getUser({
      where: { id },
      select: ['id', 'firstName', 'lastName', 'email', 'username'],
    });
  }

  async delete(id: User['id']): Promise<void> {
    await this.userService.delete(id);
  }

  async validateOAuthLogin(
    profile: any,
    provider: LoginProvider,
  ): Promise<User> {
    if (!profile) {
      throw new InternalServerError(`${provider}_auth_error`);
    }
    const email = profile.emails?.[0]?.value || `@${profile.id}`;

    let user = await this.userService.getUser({
      where: { email },
      relations: ['role'],
    });

    if (!user) {
      user = await this.userService.createOAuthUser(provider, profile);
    }

    if (user.blockedAt) {
      throw new Unauthorized('user_blocked');
    }

    Base._currentUserId = user.id;

    return user;
  }

  // Step 1: Get the Microsoft Login URL
  getMicrosoftLoginUrl() {
    return `https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize?client_id=${this.configService.get(
      'microsoft.clientId',
    )}&response_type=code&redirect_uri=${this.configService.get(
      'microsoft.callbackUri2',
    )}&response_mode=query&scope=XboxLive.signin offline_access`;
  }

  // Step 2: Exchange authorization code for a Microsoft access token
  async getMicrosoftToken(code: string): Promise<any> {
    const params = new URLSearchParams();
    params.append('client_id', this.configService.get('microsoft.clientId'));
    params.append('code', code);
    params.append(
      'redirect_uri',
      this.configService.get('microsoft.callbackUri2'),
    );
    params.append('grant_type', 'authorization_code');

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://login.microsoftonline.com/consumers/oauth2/v2.0/token',
          params.toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      console.error(
        'Error exchanging authorization code:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to exchange authorization code');
    }
  }

  // Step 3: Exchange Microsoft Access Token for Xbox Live Token
  async getXboxLiveToken(accessToken: string): Promise<any> {
    const requestBody = {
      Properties: {
        AuthMethod: 'RPS',
        SiteName: 'user.auth.xboxlive.com',
        RpsTicket: `d=${accessToken}`,
      },
      RelyingParty: 'http://auth.xboxlive.com',
      TokenType: 'JWT',
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://user.auth.xboxlive.com/user/authenticate',
          requestBody,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      console.error(
        'Error authenticating with Xbox Live:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to authenticate with Xbox Live');
    }
  }

  // Step 4: Exchange Xbox Live Token for XSTS Token
  async getXSTSToken(xboxLiveToken: string): Promise<any> {
    try {
      console.log('Requesting XSTS Token...');
      console.log(`Sending UserToken: ${xboxLiveToken}`);

      const response = await firstValueFrom(
        this.httpService.post('https://xsts.auth.xboxlive.com/xsts/authorize', {
          Properties: {
            SandboxId: 'RETAIL',
            UserTokens: [xboxLiveToken], // The Xbox Live token you previously obtained
          },
          RelyingParty: 'rp://api.minecraftservices.com/',
          TokenType: 'JWT',
        }),
      );

      console.log('XSTS Token Response:', response.data);
      return response.data;
    } catch (e) {
      console.error('XSTS Token Error - No response received:', e.message);
      throw new Error('Failed to get XSTS token');
    }
  }

  async getBearerToken(xstsToken, userHash) {
    const url = 'https://api.minecraftservices.com/authentication/login_with_xbox'
    const config = {
      headers: {
        'Content-Type': 'application/json',
      }
    }
    let data = {
      identityToken: "XBL3.0 x=" + userHash + ";" + xstsToken, "ensureLegacyEnabled": true
    }
    let response = await axios.post(url, data, config)
    return response.data['access_token']
  }

  // Step 5: Get the Minecraft Profile using XSTS Token
  async getMinecraftProfile(accessToken: string): Promise<any> {
    const xboxLiveResponse = await this.getXboxLiveToken(accessToken);
    const xstsResponse = await this.getXSTSToken(xboxLiveResponse.Token);

    const userHash = xstsResponse.DisplayClaims.xui[0].uhs;
    const xstsToken = xstsResponse.Token;



    try {
      const a = await this.getBearerToken(xstsToken, userHash)

      // const rlogin_with_xbox = await axios.post(
      //   "https://api.minecraftservices.com/authentication/login_with_xbox",
      //   {
      //     // Payload should be passed directly as the first argument
      //     identityToken: "XBL3.0 x=" + userHash + ";" + xstsToken,
      //   },
      //   {
      //     // Headers should be passed as the second argument
      //     headers: {
      //       "Content-Type": "application/json",
      //       Accept: "application/json",
      //     },
      //   }
      // );

      const rlogin_with_xbox = await firstValueFrom(
        this.httpService.post(
          'https://api.minecraftservices.com/authentication/login_with_xbox',
          {
            // Request body
            identityToken: `XBL3.0 x=${userHash};${xstsToken}`,
            ensureLegacyEnabled: true
          },
          {
            // Headers
            headers: {
              'Content-Type': 'application/json',
              // Accept: 'application/json',
            },
          },
        ),
      );



      const response = await firstValueFrom(
        this.httpService.get(
          'https://api.minecraftservices.com/minecraft/profile',
          {
            // headers: {
            //   Authorization: `XBL3.0 x=${userHash};${xstsToken}`,
            //   'Content-Type': 'application/json',
            // },
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: "Bearer " + accessToken,
            },
          },
        ),
      );

      return response.data;
    } catch (e) {
      console.error('eeeeee:', e);
      console.error(
        'Error getting Minecraft profile:',
        e.response?.data || e.message,
      );
      throw new Error('Failed to get Minecraft profile');
    }
  }

  async getAuthorizationTokenWithLocalhost(onURL: (url: string) => void) {
    const requestUrl: any = await new Promise((resolve, reject) => {
      let port;

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const server = require('http').createServer((request, response) => {
        resolve(new URL(request.url, `http://localhost:${port}`));

        response.setHeader('Location', 'https://minecraft.net');
        response.writeHead(303);
        response.end();

        server.close();
      });

      server.listen(null, '127.0.0.1', () => {
        port = server.address().port;

        this.pca
          .getAuthCodeUrl({
            redirectUri: `http://localhost:${port}`,
            scopes,
          })
          .then(onURL)
          .catch(reject);
      });
    });

    return this.pca.acquireTokenByCode({
      code: requestUrl.searchParams.get('code'),
      redirectUri: requestUrl.origin,
      scopes,
    });
  }

  async authenticateMinecraft(onURL: (url: string) => void): Promise<any> {
    try {
      // Step 1: Get Microsoft Access Token
      const msaAccessToken = await this.getAuthorizationTokenWithLocalhost(
        onURL,
      );

      console.log('msaAccessToken');
      console.log(msaAccessToken.account.username);
      console.log('');

      // Step 2: Exchange Microsoft Access Token for Xbox Live User Token
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const xblUserToken = await XboxLiveAuth.exchangeRpsTicketForUserToken(
        'd=' + msaAccessToken.accessToken,
      );

      // Step 3: Exchange Xbox Live User Token for XSTS Token
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const xsts = await XboxLiveAuth.exchangeUserTokenForXSTSIdentity(
        xblUserToken.Token,
        {
          XSTSRelyingParty,
          raw: false,
        },
      );

      // Step 4: Authenticate with Minecraft API using the XSTS token via axios
      const mcaResponse = await firstValueFrom(
        this.httpService.post(
          URL_LOGIN_XBOX,
          {
            identityToken: `XBL3.0 x=${xsts.userHash};${xsts.XSTSToken}`,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': USER_AGENT,
            },
          },
        ),
      );

      const mca = mcaResponse.data;
      console.log('mca');
      console.log(mca.username);
      console.log('');

      // Step 5: Fetch Minecraft Profile using axios
      const profileResponse = await firstValueFrom(
        this.httpService.get(URL_MC_PROFILE, {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': USER_AGENT,
            Authorization: `Bearer ${mca.access_token}`,
          },
        }),
      );

      const profile = profileResponse.data;
      console.log('profile');
      console.log(profile.name);
      console.log('');

      return profile;
    } catch (error) {
      console.error('Error during Minecraft authentication flow:', error);
      throw new Error('Failed to authenticate with Minecraft');
    }
  }
}
