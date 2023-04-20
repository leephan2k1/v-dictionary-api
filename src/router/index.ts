import { Express } from "express";
import wordRouter from "./word";
import authRouter from "./auth";
import userRouter from "./user";

function route(app: Express) {
  app.use(`/api`, wordRouter);
  app.use(`/api`, userRouter);
  app.use(`/api`, authRouter);
}

export default route;
