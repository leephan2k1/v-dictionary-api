import Router from "express-promise-router";
import { isUserAuthenticated } from "../middlewares/auth";
import {
  handleGetUserInfo,
  handleCreateTranslationHistory,
  handleGetTranslationHistory,
  handleDeleteTranslationHistory,
} from "../controllers/userController";
import {
  TranslationHistorySchema,
  DeleteTranslationHistorySchema,
} from "../schemas";
import { validate } from "../middlewares/zodValidate";

const router = Router();

router.get("/auth/user", isUserAuthenticated, handleGetUserInfo);

router.post(
  "/users/translation-history",
  isUserAuthenticated,
  validate(TranslationHistorySchema),
  handleCreateTranslationHistory
);

router.get(
  "/users/translation-history",
  isUserAuthenticated,
  //@ts-ignore
  handleGetTranslationHistory
);

router.delete(
  "/users/translation-history",
  isUserAuthenticated,
  validate(DeleteTranslationHistorySchema),
  //@ts-ignore
  handleDeleteTranslationHistory
);

export default router;
