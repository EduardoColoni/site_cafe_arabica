import { Router } from 'express';
import { cadastrarUsuario, realizarLogin, atualizarUsuario, deletarUsuario } from '../controllers/UsuarioController';

const router = Router();

router.post('/cadastrar', cadastrarUsuario);
router.post('/login', realizarLogin);

// Novas rotas para o Painel de Perfil
router.put('/atualizar/:id', atualizarUsuario);
router.delete('/deletar/:id', deletarUsuario);

export default router;