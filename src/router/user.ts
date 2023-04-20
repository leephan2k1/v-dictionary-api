import Router from "express-promise-router";
import { isUserAuthenticated } from "../middlewares/auth";
import { handleGetUserInfo } from "../controllers/userController";

const router = Router();

router.get("/auth/user", isUserAuthenticated, handleGetUserInfo);

export default router;
