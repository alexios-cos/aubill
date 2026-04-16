import { Request } from 'express';
import { User } from "../user/entity/user.js";

export interface UserAwareRequest extends Request {
    user: User
}

export const UNAUTHORIZED_AUTHENTICATION_DESCRIPTION = 'Missing or invalid Authentication token';
export const UNAUTHORIZED_REFRESH_DESCRIPTION = 'Missing or invalid Refresh token';
export const FORBIDDEN_DESCRIPTION = 'You do not have permission to perform this action';