import { Knex } from 'knex';
import { db } from '../../app/database';
import { v4 as uuidv4 } from 'uuid';
import Lib from './lib';

class TokenService {
  private table: string;
  private db: Knex<any, unknown[]> = db;
  constructor(table: string) {
    this.table = table;
  }

  // get secret by id
  public async getTokenSecretById(id: string | number) {
    const secret = await this.db(this.table)
      .select('access_token_secret', 'refresh_token_secret')
      .where('id', id);

    if (secret.length) {
      return secret[0];
    } else {
      return false;
    }
  }

  // create access token and refresh token
  public async createRefreshAccessToken(
    data: any,
    type: string,
    id: string | number
  ) {
    const access_token_secret = uuidv4();
    const refresh_token_secret = uuidv4();
    const accessToken = Lib.createToken(
      { ...data, type: 'access_token', userType: type },
      access_token_secret,
      '1h'
    );
    const refreshToken = Lib.createToken(
      { ...data, type: 'refresh_token', userType: type },
      refresh_token_secret,
      '1d'
    );

    const insertSecret = await this.db(this.table).insert({
      access_token_secret,
      refresh_token_secret,
      user_id: id,
    });

    if (insertSecret.length) {
      return {
        success: true,
        data: { accessToken, refreshToken, uuid: insertSecret[0] },
      };
    } else {
      return {
        success: false,
        message: 'Cannot create token!',
      };
    }
  }

  // update access token and refresh token
  public async updateRefreshAccessToken(data: any, id: string | number) {
    const access_token_secret = uuidv4();
    const refresh_token_secret = uuidv4();
    const accessToken = Lib.createToken(
      { ...data, type: 'access_token' },
      access_token_secret,
      '1h'
    );
    const refreshToken = Lib.createToken(
      { ...data, type: 'refresh_token' },
      refresh_token_secret,
      '1d'
    );

    const update = await this.db(this.table)
      .update({
        access_token_secret,
        refresh_token_secret,
      })
      .where('id', id);

    if (update) {
      return {
        success: true,
        data: { accessToken, refreshToken, uuid: id },
      };
    } else {
      return {
        success: false,
        message: 'Cannot update token!',
      };
    }
  }

  // delete secret by id
  public async deleteTokenSecretById(id: string | number) {
    const secret = await this.db(this.table).delete().where('id', id);

    if (secret) {
      return {
        success: true,
        message: 'Secret deleted',
      };
    } else {
      return {
        success: false,
        message: 'No secret of this id',
      };
    }
  }

  // delete all secret of an user
  public async deleteAllTokenSecretOfUser(id: string | number) {
    const secret = await this.db(this.table).delete().andWhere('user_id', id);

    if (secret) {
      return {
        success: true,
        message: 'Secret deleted',
      };
    } else {
      return {
        success: false,
        message: 'No secret of this id',
      };
    }
  }
}
export default TokenService;
