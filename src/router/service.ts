import type { NextFunction, Request, Response } from "express";

import Router from "express-promise-router";
const router = Router();

router.get(
  "/service/ping",
  (req: Request, res: Response, next: NextFunction) => {
    const key = req.headers["x-api-key"];

    if (
      !key ||
      typeof key !== "string" ||
      key !== `${process.env.CRON_API_KEY}`
    ) {
      return res.status(401).end();
    }

    return res.status(200).json({ message: "pong" });
  }
);

export default router;
