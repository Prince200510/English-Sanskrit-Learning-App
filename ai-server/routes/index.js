import express from 'express';
import cors from 'cors';
import translateRouter from './translator.routes.js';
import flashCardsRouter from './flashCards.routes.js';
import grammarExerciseRouter from './grammarExercise.routes.js';

const router = express.Router();
router.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
}));
router.use('/translate', translateRouter);
router.use('/flashcards', flashCardsRouter);
router.use('/grammar', grammarExerciseRouter);

export default router;
