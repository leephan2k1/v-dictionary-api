import express from "express";
import createError from "http-errors";
import { Prisma, PrismaClient } from "@prisma/client";
import route from "./router";
import type { Request, Response, NextFunction } from "express";
import type { ErrorType } from "./types";
import cors from "cors";

const prisma = new PrismaClient();
const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

//routers
route(app);

//catch 404
app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404, "404 Not Found!"));
});

//error handler
app.use((err: ErrorType, req: Request, res: Response, next: NextFunction) => {
  const error: ErrorType =
    app.get("env") === "development" ? err : ({} as ErrorType);
  const status: number = err.status || 500;

  console.log(
    `${req.url} --- ${req.method} --- ${JSON.stringify({
      message: error.message,
    })}`
  );
  return res.status(status).json({
    status,
    message: error.message,
  });
});

app.listen(PORT, () =>
  console.log(`🚀 Server ready at: http://localhost:${PORT}`)
);
