import { JwtUser } from '../../core/auth/models/jwt-user.model';

declare global {
  namespace Express {
    interface Request {
      user?: JwtUser;
    }
  }
}
