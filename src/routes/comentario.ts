import { Router } from 'express';
import { criarComentario, listarComentarios } from '../controllers/ComentarioController';

const router = Router();

router.post('/novo', criarComentario);
router.get('/lista', listarComentarios);

export default router;