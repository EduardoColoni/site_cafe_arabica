import { Router } from 'express';
import { criarComentario, listarComentarios, editarComentario, deletarComentario } from '../controllers/ComentarioController';

const router = Router();

router.post('/novo', criarComentario);
router.get('/lista', listarComentarios);

router.put('/editar/:id', editarComentario);
router.delete('/deletar/:id', deletarComentario);

export default router;