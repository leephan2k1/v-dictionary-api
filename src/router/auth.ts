import Router from "express-promise-router";
import passport from "passport";

const router = Router();

router.get(
  "/login/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
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
