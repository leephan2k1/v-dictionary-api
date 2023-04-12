import Router from "express-promise-router";
import { search, getWordDetail, getAudio } from "../controllers/wordController";

const router = Router();

router.get("/words/search", search);

router.get("/words/detail/:word", getWordDetail);

router.get("/words/audio/:word", getAudio);

export default router;
