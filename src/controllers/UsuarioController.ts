import { Request, Response } from 'express';
import Usuario from '../models/Usuario';
import Comentario from '../models/Comentario'; // Importamos para poder apagar os comentários ao excluir a conta
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

    const saltRounds = 10;
    const senhaCriptografada = await bcrypt.hash(senha, saltRounds);

    const novoUsuario = await Usuario.create({
      nome, sobrenome, telefone, email, cpf, senha: senhaCriptografada
    });

    res.status(201).json({ message: "Usuário cadastrado com sucesso!", usuario: novoUsuario });

  } catch (err: any) {
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

    if (!email || !senha) {
      res.status(400).json({ error: "E-mail e senha são obrigatórios para o login." });
      return;
    }

    const usuario: any = await Usuario.findOne({ where: { email } });

    if (!usuario) {
      res.status(404).json({ error: "Usuário não encontrado." });
      return;
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (senhaValida) {
      // ADICIONADO: Agora também enviamos o sobrenome de volta
      res.status(200).json({ 
        message: "Login realizado com sucesso!", 
        id: usuario.id, 
        nome: usuario.nome, 
        sobrenome: usuario.sobrenome, 
        email: usuario.email 
      });
    } else {
      res.status(401).json({ error: "Senha incorreta." });
    }
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao realizar login.", details: err.message });
  }
};

// ==========================================
// CRUD DE USUÁRIO (UPDATE INDIVIDUALIZADO)
// ==========================================
export const atualizarUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nome, sobrenome, email } = req.body; // Agora recebe os 3

    const usuario: any = await Usuario.findByPk(Number(id));
    if (!usuario) {
      res.status(404).json({ error: "Usuário não encontrado." });
      return;
    }

    // Cria um objeto apenas com o que a pessoa escolheu alterar
    const camposParaAtualizar: any = {};

    if (nome !== undefined && nome.trim() !== "") {
      if (nome.trim().length < 2) {
        res.status(400).json({ error: "O nome deve ter pelo menos 2 caracteres." });
        return;
      }
      camposParaAtualizar.nome = nome.trim();
    }

    if (sobrenome !== undefined && sobrenome.trim() !== "") {
      if (sobrenome.trim().length < 2) {
        res.status(400).json({ error: "O sobrenome deve ter pelo menos 2 caracteres." });
        return;
      }
      camposParaAtualizar.sobrenome = sobrenome.trim();
    }

    if (email !== undefined && email.trim() !== "") {
      if (!validarEmailBackend(email)) {
        res.status(400).json({ error: "E-mail inválido." });
        return;
      }
      camposParaAtualizar.email = email.trim();
    }

    if (Object.keys(camposParaAtualizar).length === 0) {
      res.status(400).json({ error: "Nenhum dado válido fornecido para atualização." });
      return;
    }

    await usuario.update(camposParaAtualizar);
    
    res.status(200).json({ 
      message: "Dados atualizados com sucesso!", 
      nome: usuario.nome, 
      sobrenome: usuario.sobrenome, 
      email: usuario.email 
    });
  } catch (err: any) {
    if (err.name === "SequelizeUniqueConstraintError") {
      res.status(409).json({ error: "Este E-mail já está em uso por outra conta." });
    } else {
      res.status(500).json({ error: "Erro ao atualizar usuário.", details: err.message });
    }
  }
};

export const deletarUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const usuario: any = await Usuario.findByPk(Number(id));

    if (!usuario) {
      res.status(404).json({ error: "Usuário não encontrado." });
      return;
    }

    // REGRA DE OURO: Apaga os comentários antes de apagar o usuário para o banco de dados não bloquear
    await Comentario.destroy({ where: { usuarioId: Number(id) } });
    
    // Apaga a conta do usuário
    await usuario.destroy();

    res.status(200).json({ message: "Conta e comentários excluídos com sucesso!" });
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao excluir conta.", details: err.message });
  }
};