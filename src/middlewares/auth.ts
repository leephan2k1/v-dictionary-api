import type { NextFunction, Request, Response } from "express";

export function isUserAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.user) {
    next();
  } else {
    res.status(403).send("You must login first!");
  }
}
