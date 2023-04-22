import Router from "express-promise-router";
import {
  search,
  getWordDetail,
  getAudio,
  getWordDetailByMachine,
  getGrammar,
} from "../controllers/wordController";

const router = Router();

router.get("/words/search", search);

router.get("/words/translate/:word", getWordDetail);

router.post("/words/machine_translation", getWordDetailByMachine);

router.get("/words/grammar/:word", getGrammar);

router.get("/words/audio/:word", getAudio);

export default router;
