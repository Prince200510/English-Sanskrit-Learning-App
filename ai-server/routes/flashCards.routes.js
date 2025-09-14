import express from 'express';
import { flashCardsGen } from '../controller/flashCards.controller.js';

const router = express.Router();
router.get('/', (req, res) => {
  res.send('Hello World! from flashcards.routes.js');
});
router.post('/generate', flashCardsGen);

export default router;
