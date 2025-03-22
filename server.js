require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Apenas imagens são permitidas!'), false);
    }
    cb(null, true);
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/site-amor')
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('Erro na conexão com MongoDB:', err));

// Define schemas and models
const photoSchema = new mongoose.Schema({
  filename: String,
  path: String,
  caption: String,
  date: { type: Date, default: Date.now }
});

const blogSchema = new mongoose.Schema({
  title: String,
  content: String,
  date: { type: Date, default: Date.now }
});

const eventSchema = new mongoose.Schema({
  type: String,
  date: Date,
  details: String
});

const Photo = mongoose.model('Photo', photoSchema);
const Blog = mongoose.model('Blog', blogSchema);
const Event = mongoose.model('Event', eventSchema);

// API Routes

// Photos
app.post('/api/photos', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma foto enviada' });
    }

    const newPhoto = new Photo({
      filename: req.file.filename,
      path: req.file.path,
      caption: req.body.caption || 'Nosso momento especial'
    });

    await newPhoto.save();
    res.status(201).json(newPhoto);
  } catch (error) {
    console.error('Erro ao salvar foto:', error);
    res.status(500).json({ error: 'Erro ao salvar foto' });
  }
});

app.get('/api/photos', async (req, res) => {
  try {
    const photos = await Photo.find().sort({ date: -1 });
    res.json(photos);
  } catch (error) {
    console.error('Erro ao buscar fotos:', error);
    res.status(500).json({ error: 'Erro ao buscar fotos' });
  }
});

app.put('/api/photos/:id', async (req, res) => {
  try {
    const photo = await Photo.findByIdAndUpdate(
      req.params.id,
      { caption: req.body.caption },
      { new: true }
    );
    
    if (!photo) {
      return res.status(404).json({ error: 'Foto não encontrada' });
    }
    
    res.json(photo);
  } catch (error) {
    console.error('Erro ao atualizar foto:', error);
    res.status(500).json({ error: 'Erro ao atualizar foto' });
  }
});

app.delete('/api/photos/:id', async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    
    if (!photo) {
      return res.status(404).json({ error: 'Foto não encontrada' });
    }
    
    // Delete file from filesystem
    if (fs.existsSync(photo.path)) {
      fs.unlinkSync(photo.path);
    }
    
    await Photo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Foto excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir foto:', error);
    res.status(500).json({ error: 'Erro ao excluir foto' });
  }
});

// Blog entries
app.post('/api/blog', async (req, res) => {
  try {
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Título e conteúdo são obrigatórios' });
    }
    
    const newBlog = new Blog({ title, content });
    await newBlog.save();
    
    res.status(201).json(newBlog);
  } catch (error) {
    console.error('Erro ao salvar blog:', error);
    res.status(500).json({ error: 'Erro ao salvar blog' });
  }
});

app.get('/api/blog', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ date: -1 });
    res.json(blogs);
  } catch (error) {
    console.error('Erro ao buscar blogs:', error);
    res.status(500).json({ error: 'Erro ao buscar blogs' });
  }
});

app.put('/api/blog/:id', async (req, res) => {
  try {
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Título e conteúdo são obrigatórios' });
    }
    
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { title, content },
      { new: true }
    );
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog não encontrado' });
    }
    
    res.json(blog);
  } catch (error) {
    console.error('Erro ao atualizar blog:', error);
    res.status(500).json({ error: 'Erro ao atualizar blog' });
  }
});

app.delete('/api/blog/:id', async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog não encontrado' });
    }
    
    res.json({ message: 'Blog excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir blog:', error);
    res.status(500).json({ error: 'Erro ao excluir blog' });
  }
});

// Events
app.post('/api/events', async (req, res) => {
  try {
    const { type, date, details } = req.body;
    
    if (!type || !date || !details) {
      return res.status(400).json({ error: 'Tipo, data e detalhes são obrigatórios' });
    }
    
    // First delete any existing event (we only keep one)
    await Event.deleteMany({});
    
    const newEvent = new Event({ type, date, details });
    await newEvent.save();
    
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Erro ao salvar evento:', error);
    res.status(500).json({ error: 'Erro ao salvar evento' });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const event = await Event.findOne();
    res.json(event);
  } catch (error) {
    console.error('Erro ao buscar evento:', error);
    res.status(500).json({ error: 'Erro ao buscar evento' });
  }
});

app.delete('/api/events', async (req, res) => {
  try {
    await Event.deleteMany({});
    res.json({ message: 'Evento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir evento:', error);
    res.status(500).json({ error: 'Erro ao excluir evento' });
  }
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 