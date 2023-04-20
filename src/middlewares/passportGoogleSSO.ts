//@ts-nocheck
import passport from "passport";
import passportGoogle from "passport-google-oauth20";
import { prisma } from "../utils/prismaClient";

const GoogleStrategy = passportGoogle.Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: `${process.env.GOOGLE_CLIENT_ID}`,
      clientSecret: `${process.env.GOOGLE_CLIENT_SECRET}`,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },

    async (req, accessToken, refreshToken, profile, cb) => {
      try {
        const user = await prisma.user.upsert({
          where: { accountId: profile.id },
          create: {
            name: `${profile.name.givenName} ${profile.name.familyName}`,
            email: profile.emails[0].value,
            image: profile.photos[0].value,
            accountId: profile.id,
            provider: "google",
          },
          update: {},
        });

        if (user) return cb(null, user);
      } catch (err) {
        console.log("Error signing up", err);
        cb(err, null);
      }
    }
  )
);

passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser(async (id, cb) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        image: true,
        name: true,
        provider: true,
      },
    });

    if (user) cb(null, user);
  } catch (err) {
    console.log("Error deserializing", err);
    cb(err, null);
  }
});
