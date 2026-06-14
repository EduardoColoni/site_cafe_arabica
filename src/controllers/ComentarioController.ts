import { Request, Response } from 'express';
import Comentario from '../models/Comentario';
import Usuario from '../models/Usuario';

export const criarComentario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { usuarioId, tipoCafe, metodoPreparo, texto } = req.body;

    // =========================================================
    // 1. VALIDAÇÃO FAIL FAST
    // Barra a requisição antes de chegar no banco
    // =========================================================
    if (!usuarioId) {
      res.status(401).json({ error: "Você precisa estar logado para comentar." });
      return;
    }
    if (!tipoCafe || tipoCafe.trim().length === 0) {
      res.status(400).json({ error: "Informe o seu tipo de café preferido." });
      return;
    }
    if (!metodoPreparo || metodoPreparo.trim().length === 0) {
      res.status(400).json({ error: "Informe o seu método de preparo preferido." });
      return;
    }
    if (!texto || texto.trim().length < 5) {
      res.status(400).json({ error: "O comentário deve ter pelo menos 5 caracteres." });
      return;
    }

    const usuario = await Usuario.findByPk(usuarioId);
    if (!usuario) {
      res.status(404).json({ error: "Usuário inválido ou não encontrado." });
      return;
    }

    const novoComentario = await Comentario.create({
      usuarioId,
      tipoCafe,
      metodoPreparo,
      texto
    });

    res.status(201).json({ message: "Comentário publicado com sucesso!", comentario: novoComentario });
  } catch (error: any) {
    res.status(500).json({ error: "Erro interno ao salvar comentário.", details: error.message });
  }
};

export const listarComentarios = async (req: Request, res: Response): Promise<void> => {
  try {
    // Busca os comentários e já traz o nome do autor junto (sem trazer a senha dele!)
    const comentarios = await Comentario.findAll({
      include: [{
        model: Usuario,
        as: 'autor',
        attributes: ['nome', 'sobrenome']
      }],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    res.status(200).json(comentarios);
  } catch (error: any) {
    res.status(500).json({ error: "Erro ao buscar comentários.", details: error.message });
  }
};

// ==========================================
// CRUD: UPDATE (EDITAR)
// ==========================================
export const editarComentario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // ID do comentário na URL
    const { texto, usuarioId } = req.body; // Dados novos e quem está pedindo

    // CONVERSÃO APLICADA AQUI: Number(id)
    const comentario: any = await Comentario.findByPk(Number(id));

    if (!comentario) {
      res.status(404).json({ error: "Comentário não encontrado." });
      return;
    }

    // Regra de Segurança: Garante que só o dono pode editar
    if (String(comentario.usuarioId) !== String(usuarioId)) {
      res.status(403).json({ error: "Você só pode editar os seus próprios comentários." });
      return;
    }

    if (!texto || texto.trim().length < 5) {
      res.status(400).json({ error: "O texto editado deve ter pelo menos 5 caracteres." });
      return;
    }

    // Atualiza o banco de dados
    await comentario.update({ texto });

    res.status(200).json({ message: "Comentário atualizado com sucesso!" });
  } catch (error: any) {
    res.status(500).json({ error: "Erro ao atualizar comentário.", details: error.message });
  }
};

// ==========================================
// CRUD: DELETE (EXCLUIR)
// ==========================================
export const deletarComentario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { usuarioId } = req.body;

    // CONVERSÃO APLICADA AQUI: Number(id)
    const comentario: any = await Comentario.findByPk(Number(id));

    if (!comentario) {
      res.status(404).json({ error: "Comentário não encontrado." });
      return;
    }

    // Regra de Segurança: Garante que só o dono pode excluir
    if (String(comentario.usuarioId) !== String(usuarioId)) {
      res.status(403).json({ error: "Você só pode excluir os seus próprios comentários." });
      return;
    }

    // Remove do banco de dados
    await comentario.destroy();

    res.status(200).json({ message: "Comentário excluído com sucesso!" });
  } catch (error: any) {
    res.status(500).json({ error: "Erro ao excluir comentário.", details: error.message });
  }
};