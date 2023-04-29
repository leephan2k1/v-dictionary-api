//@ts-nocheck
import passport from "passport";
import passportFacebook from "passport-facebook";
import { prisma } from "../utils/prismaClient";

const FacebookStrategy = passportFacebook.Strategy;

passport.use(
  new FacebookStrategy(
    {
      clientID: `${process.env.FACEBOOK_APP_ID}`,
      clientSecret: `${process.env.FACEBOOK_APP_SECRET}`,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      profileFields: ["id", "displayName", "photos", "email"],
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        const user = await prisma.user.upsert({
          where: { accountId: profile.id },
          create: {
            name: `${profile.displayName}`,
            email: profile.emails[0].value,
            image: profile.photos[0].value,
            accountId: profile.id,
            provider: "facebook",
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
