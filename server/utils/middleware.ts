import { NextFunction, Request, Response } from "express";
import { isError, turso } from "../database";

export async function errorBoundary(
  req: Request,
  res: Response,
  execute: (req: Request, res: Response) => Promise<any>
) {
  try {
    execute(req, res);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export function getToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return null;
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return null;
  }
  return token;
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = getToken(req);
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const user = await turso.loginWithToken(token);
  if (isError(user)) {
    res.status(user.code).json({ message: user.message });
    return;
  }
  req.isSubscribed = isSubscribed(user.subscriptionEnd);
  if (!req.isSubscribed) {
    // TODO: update subscription in DB
  }
  req.user = user;
  next();
}

export function isSubscribed(subscriptionEnd: number | null) {
  return subscriptionEnd !== null && subscriptionEnd > Date.now();
}

export function getLimitAndOffset(req: Request, maxLimit: number = 10) {
  let { limit, offset }: { limit?: number; offset?: number } = req.query;
  if (!limit || typeof limit !== "number" || limit < 1) {
    limit = maxLimit;
  }
  if (!offset || typeof offset !== "number" || offset < 0) {
    offset = 0;
  }
  return { limit, offset };
}
