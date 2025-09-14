import express from 'express';
import { grammarExercise } from '../controller/grammarExercise.controller.js';

const router = express.Router();
router.get('/', (req, res) => {
  res.send('Hello World! from grammarExercise.routes.js');
});
router.post('/generate', grammarExercise);

export default router;
