import { Request, Response } from 'express';
import Usuario from '../models/Usuario';
import bcrypt from 'bcrypt';

const validarEmailBackend = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const cadastrarUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nome, sobrenome, telefone, email, cpf, senha } = req.body;

    if (!nome || nome.trim().length < 2) {
      res.status(400).json({ error: "O nome deve ter pelo menos 2 caracteres." });
      return;
    }
    if (!sobrenome || sobrenome.trim().length < 2) {
      res.status(400).json({ error: "O sobrenome deve ter pelo menos 2 caracteres." });
      return;
    }
    if (!telefone || telefone.replace(/\D/g, '').length < 10) {
      res.status(400).json({ error: "Telefone inválido." });
      return;
    }
    if (!email || !validarEmailBackend(email)) {
      res.status(400).json({ error: "E-mail inválido." });
      return;
    }
    if (!cpf || cpf.replace(/\D/g, '').length !== 11) {
      res.status(400).json({ error: "CPF inválido." });
      return;
    }
    if (!senha || senha.length < 8) {
      res.status(400).json({ error: "A senha não atende aos requisitos mínimos." });
      return;
    }

    // 2. Criptografa a senha antes de salvar
    const saltRounds = 10;
    const senhaCriptografada = await bcrypt.hash(senha, saltRounds);

    // 3. Cria o usuário no banco
    const novoUsuario = await Usuario.create({
      nome,
      sobrenome,
      telefone,
      email,
      cpf,
      senha: senhaCriptografada
    });

    res.status(201).json({ message: "Usuário cadastrado com sucesso!", usuario: novoUsuario });

  } catch (err: any) {
    // 4. Tratativa de erros vindos do Banco
    if (err.name === "SequelizeUniqueConstraintError") {
      res.status(409).json({ error: "Este E-mail ou CPF já estão cadastrados no sistema." });
    } else {
      res.status(500).json({ error: "Erro interno ao cadastrar usuário.", details: err.message });
    }
  }
};

export const realizarLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, senha } = req.body;

    // Validação rápida de login
    if (!email || !senha) {
      res.status(400).json({ error: "E-mail e senha são obrigatórios para o login." });
      return;
    }

    // Busca o usuário pelo e-mail
    const usuario: any = await Usuario.findOne({ where: { email } });

    if (!usuario) {
      res.status(404).json({ error: "Usuário não encontrado." });
      return;
    }

    // Compara a senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (senhaValida) {
      res.status(200).json({ message: "Login realizado com sucesso!", nome: usuario.nome, id: usuario.id });
    } else {
      res.status(401).json({ error: "Senha incorreta." });
    }
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao realizar login.", details: err.message });
  }
};