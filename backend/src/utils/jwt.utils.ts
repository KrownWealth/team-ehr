import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { config } from "../config/env";

export const generateAccessToken = (userId: string): string => {
  const options: SignOptions = {
    expiresIn: config.jwt.expiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign({ userId }, config.jwt.secret as Secret, options);
};

export const generateRefreshToken = (userId: string): string => {
  const options: SignOptions = {
    expiresIn: config.jwt.refreshExpiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign({ userId }, config.jwt.refreshSecret as Secret, options);
};

export const verifyAccessToken = (token: string): any => {
  return jwt.verify(token, config.jwt.secret);
};

export const verifyRefreshToken = (token: string): any => {
  return jwt.verify(token, config.jwt.refreshSecret);
};
