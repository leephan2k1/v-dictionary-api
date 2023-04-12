import { Express } from "express";
import wordRouter from "./word";

function route(app: Express) {
  app.use(`/api`, wordRouter);
}

export default route;
