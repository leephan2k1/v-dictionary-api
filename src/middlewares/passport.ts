import passport from "passport";
import passportJwt from "passport-jwt";
import { prisma } from "../utils/prismaClient";

const ExtractJwt = passportJwt.ExtractJwt;
const StrategyJwt = passportJwt.Strategy;

passport.use(
  new StrategyJwt(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async function (jwtPayload, done) {
      return prisma.user
        .findFirst({ where: { id: jwtPayload } })
        .then((user) => {
          return done(null, user || undefined);
        })
        .catch((err) => {
          return done(err);
        });
    }
  )
);
