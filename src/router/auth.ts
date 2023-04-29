import Router from "express-promise-router";
import passport from "passport";
import type { NextFunction, Request, Response } from "express";

const router = Router();

router.get(
  "/login/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/login/facebook",
  passport.authenticate("facebook", {
    scope: ["public_profile", "email"],
  })
);

router.get("/logout", (req: Request, res: Response, next: NextFunction) => {
  req.logOut((err) => {
    if (err) {
      console.log("err:: ", err);
      return next(err);
    }

    req?.session?.destroy((err) => {
      if (err) console.error(err);
    });

    res.clearCookie("connect.sid");
    return res.status(200).json({ status: "success" });
  });
});

router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    failureMessage: "Cannot login to Facebook, please try again later!",
    successRedirect: `${process.env.CLIENT_URL}`,
    failureRedirect: `${process.env.CLIENT_URL}`,
  }),
  (req, res) => {
    console.log("User: ", req?.user);
    return res.status(200).json({ message: '"Logged"' });
  }
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureMessage: "Cannot login to Google, please try again later!",
    successRedirect: `${process.env.CLIENT_URL}`,
    failureRedirect: `${process.env.CLIENT_URL}`,
  }),
  (req, res) => {
    console.log("User: ", req?.user);
    return res.status(200).json({ message: '"Logged"' });
  }
);

export default router;
