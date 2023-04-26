import Router from "express-promise-router";
import { isUserAuthenticated } from "../middlewares/auth";
import {
  handleGetUserInfo,
  handleCreateTranslationHistory,
  handleGetTranslationHistory,
  handleDeleteTranslationHistory,
  handleGetInfoFavorite,
  handleCreateFavorite,
  handleDeleteFavorite,
  handleGetDashboardInfo,
  handleGetWordsPreview,
} from "../controllers/userController";

import {
  TranslationHistorySchema,
  DeleteTranslationHistorySchema,
  FavoriteQuerySchema,
  FavoriteBodySchema,
  DashboardQuerySchema,
  WordPreviewQuerySchema,
} from "../schemas";

import { validate } from "../middlewares/zodValidate";

const router = Router();

router.get("/auth/user", isUserAuthenticated, handleGetUserInfo);

router.get(
  "/users/dashboard",
  isUserAuthenticated,
  validate(DashboardQuerySchema),
  handleGetDashboardInfo
);

router.get(
  "/users/word-preview",
  isUserAuthenticated,
  validate(WordPreviewQuerySchema),
  //@ts-ignore
  handleGetWordsPreview
);

router.get(
  "/users/favorite",
  isUserAuthenticated,
  validate(FavoriteQuerySchema),
  handleGetInfoFavorite
);

router.post(
  "/users/favorite",
  isUserAuthenticated,
  validate(FavoriteBodySchema),
  handleCreateFavorite
);

router.delete(
  "/users/favorite",
  isUserAuthenticated,
  validate(FavoriteBodySchema),
  handleDeleteFavorite
);

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
