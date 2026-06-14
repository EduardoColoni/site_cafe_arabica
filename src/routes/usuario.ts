import { Router } from 'express';
import { cadastrarUsuario, realizarLogin } from '../controllers/UsuarioController';

const router = Router();

// Define as rotas que vão receber os dados do seu script.js
router.post('/cadastrar', cadastrarUsuario);
router.post('/login', realizarLogin);

export default router;