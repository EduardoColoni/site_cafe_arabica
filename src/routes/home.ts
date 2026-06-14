import { Router, Request, Response } from 'express';
const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.render('index'); // Carrega a sua página inicial do Café
});

export default router;