import { NextFunction, Request, Response } from 'express';
import Lib from '../../../utils/lib/lib';
import TokenService from '../../../utils/lib/tokenService';
import config from '../../../utils/config/config';
import { IAdmin } from '../../../../global';
class AdminAuthChecker {
  public tokenService: TokenService;
  constructor() {
    this.tokenService = new TokenService('admin_auth_secret');
  }

  public authChecker = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { authorization } = req.headers;
    if (!authorization) {
      return res
        .status(401)
        .json({ success: false, message: 'Unauthorized request!' });
    }

    const authSplit = authorization.split(' ');
    if (authSplit.length !== 2) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization structure.',
      });
    }

    const verify = Lib.verifyToken(
      authSplit[1],
      config.JWT_SECRET_ADMIN
    ) as IAdmin;

    if (!verify) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid token or token expired!' });
    } else {
      if (verify.type !== 'admin' || verify.au_status === 0) {
        return res.status(401).json({
          success: false,
          message: 'Wrong token or blocked user',
        });
      } else {
        req.user = verify as IAdmin;
        next();
      }
    }
  };

  public auth2Checker = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { authorization } = req.headers;
    if (!authorization) {
      return res
        .status(401)
        .json({ success: false, message: 'Unauthorized request!' });
    }
    const authSplit = authorization.split(' ');
    if (authSplit.length !== 3) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization structure.',
      });
    }

    const secretId = authSplit[1];
    const token = authSplit[2];

    const secret = await this.tokenService.getTokenSecretById(secretId);

    if (!secret) {
      return res
        .status(401)
        .json({ success: false, message: 'Unauthorized request!' });
    }

    const verify = Lib.verifyToken(token, secret.access_token_secret);

    if (!verify) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid token or token expired!' });
    }

    next();
  };
}

export default AdminAuthChecker;
