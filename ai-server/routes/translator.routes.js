import express from 'express';
import multer from 'multer';
import { geminiTextStream, geminiChatText, translateEnglishToSanskrit, getTranslationMethods,} from '../controller/translator.controller.js';

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Hello World! from translate.routes.js ');
});
router.post('/stream', geminiTextStream);
router.post('/file', upload.single('file'), geminiChatText);
router.post('/english-to-sanskrit', translateEnglishToSanskrit);
router.get('/methods', getTranslationMethods);
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Translation routes working' });
});

export default router;
