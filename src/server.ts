import express from 'express';
import path from 'path';
import sequelize from './config/database';

// Importando os Modelos
import Usuario from './models/Usuario';
import Comentario from './models/Comentario';

// Importando as rotas
import homeRoutes from './routes/home';
import usuarioRoutes from './routes/usuario';
import comentarioRoutes from './routes/comentario';

const app = express();

// Configurações do EJS e Middlewares (mantenha como estava)
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));
app.use(express.static(path.join(process.cwd(), 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conectando as rotas
app.use('/', homeRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/comentario', comentarioRoutes); // <-- Conectando a rota nova

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // ==========================================
    // DEFININDO RELACIONAMENTOS DO BANCO
    // 1 Usuário tem Vários Comentários
    // 1 Comentário pertence a 1 Usuário
    // ==========================================
    Usuario.hasMany(Comentario, { foreignKey: 'usuarioId', as: 'comentarios' });
    Comentario.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'autor' });

    await sequelize.authenticate();
    await sequelize.sync();
    
    console.log("Conexão com o banco de dados SQLite estabelecida com sucesso.");
    
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (err) {
    console.error("Não foi possível conectar ao banco de dados:", err);
  }
};

startServer();