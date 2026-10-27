import jwt, { SignOptions } from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;
const EXPIRES_IN: SignOptions["expiresIn"] = (process.env.JWT_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"];

if (!SECRET) {
  throw new Error("JWT_SECRET is not set in environment variables");
}

export interface JwtPayload {
  sub: string; // userId
  email: string;
  name: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET as string, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET as string) as JwtPayload;
}

