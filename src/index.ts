import cors from "cors";
import express from "express";
import session from "express-session";
import helmet from "helmet";
import createError from "http-errors";
import passport from "passport";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { prisma } from "./utils/prismaClient";
import route from "./router";
import connectDB from "./utils/prismaClient";

import type { ErrorType } from "./types";
import type { NextFunction, Request, Response } from "express";

import("./middlewares/passport");
import("./middlewares/passportGoogleSSO");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(
  session({
    secret: `${process.env.COOKIE_SECRET}`,
    resave: true,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (ms)
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", //development can't serve https (SSL)
    },
    //@ts-ignore
    //we need store session, because it will leak memory under most conditions if
    //store on memory and the sever can down or break,...
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000, // 2m (ms) => PrismaSessionStore will automatically remove expired sessions
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);

app.use(cors({ credentials: true, origin: `${process.env.CLIENT_URL}` }));
app.use(helmet());
app.use(express.json());

//passport middleware:
app.use(passport.initialize());

// we don't need passport deserializeUser every route
// just need for auth route
app.use((req, res, next) => {
  if (req.url.match("/api/words") || req.url.match("/api/service")) {
    console.log("run next");
    next();
  } else {
    console.log("handle cookie");
    passport.session()(req, res, next);
  }
});

//db connection info
(async function () {
  await connectDB();
})();

//routers
route(app);

app.get("/", (req, res) => {
  res.json({
    message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄",
  });
});

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
