const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Route de login personnalisée
server.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const db = router.db;
  const user = db.get('users').find({ email, password }).value();
  
  if (user) {
    const { password, ...userWithoutPassword } = user;
    res.json({
      user: userWithoutPassword,
      token: `fake-jwt-token-${user.id}`
    });
  } else {
    res.status(401).json({ message: 'Email ou mot de passe incorrect' });
  }
});

// Middleware pour vérifier le token sur les routes protégées
server.use('/books', (req, res, next) => {
  const token = req.headers.authorization;
  
  if (req.method === 'GET' || req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
    if (!token || !token.startsWith('Bearer fake-jwt-token-')) {
      return res.status(401).json({ message: 'Token manquant ou invalide' });
    }
  }
  
  next();
});

server.use('/api', router);
server.listen(3001, () => {
  console.log('JSON Server is running on http://localhost:3001');
});