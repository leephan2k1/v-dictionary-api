import type { NextFunction, Request, Response } from "express";

export async function handleGetUserInfo(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    return res.status(200).json(req.user);
  } catch (error) {
    console.error("handleGetUserInfo ERROR: ", error);
    return res.status(500).json("ERROR");
  }
}
