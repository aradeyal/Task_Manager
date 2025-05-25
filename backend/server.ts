import * as http from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Task } from './models/Tasks';
import { User, getUserId, generateToken } from './auth';
dotenv.config({ path: './backend/.env' }); // ✅ זה טוען את המשתנים



const PORT = 3000;

mongoose.connect(process.env.MONGO_URI!)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204).end();
    return;
  }

  const readBody = (cb: (body: string) => void) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => cb(body));
  };

 // REGISTER
 if (req.url === '/register' && req.method === 'POST') {
    readBody(async raw => {
      try {
        const { username, password } = JSON.parse(raw);
        const existing = await User.findOne({ username });
        if (existing) return res.writeHead(409).end('User exists');
        const newUser = new User({ username, password });
        await newUser.save();
        res.writeHead(201).end('User registered');
      } catch (err) {
        console.error('❌ Register error:', err);
        res.writeHead(400).end('Invalid');
      }
    });
    return;
  }
  
  
  

  if (req.url === '/login' && req.method === 'POST') {
    readBody(async raw => {
      try {
        const { username, password } = JSON.parse(raw);
  
        const user = await User.findOne({ username });  
        if (!user || user.password !== password) {
          console.log('❌ Login failed: Invalid username or password');
          res.writeHead(401).end('Invalid credentials');
          return;
        }
  
        const token = generateToken(user._id.toString());
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ token }));
        console.log('✅ Login successful, token sent');
      } catch (err) {
        console.error('❌ Login error:', err);
        res.writeHead(400).end('Invalid request body');
      }
    });
    return;
  }
  

  // GET TASKS
  if (req.url === '/tasks' && req.method === 'GET') {
    const userId = getUserId(req);
    if (!userId) return res.writeHead(401).end('Unauthorized');
    Task.find({ userId }).then(tasks => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(tasks));
    });
    return;
  }

  // ADD TASK
  if (req.url === '/tasks' && req.method === 'POST') {
    const userId = getUserId(req);
    if (!userId) return res.writeHead(401).end('Unauthorized');
    readBody(async raw => {
      try {
        const { text, dueDate, dueTime, category, completed } = JSON.parse(raw);
        const newTask = new Task({
          text,
          dueDate,
          dueTime,
          createdAt: Date.now(),
          category,
          completed: typeof completed === 'boolean' ? completed : false,
          userId,
        });
        await newTask.save();
        res.writeHead(201).end(JSON.stringify({ message: 'added' }));
      } catch {
        res.writeHead(400).end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // UPDATE TASK
  if (req.url?.startsWith('/tasks/') && req.method === 'PUT') {
    const userId = getUserId(req);
    if (!userId) return res.writeHead(401).end('Unauthorized');
    const id = req.url.split('/')[2];
    readBody(async raw => {
      try {
        const data = JSON.parse(raw);
        const task = await Task.findOne({ _id: id, userId });
        if (!task) return res.writeHead(403).end('Not allowed');
        await Task.findByIdAndUpdate(id, data);
        res.writeHead(200).end(JSON.stringify({ message: 'updated' }));
      } catch {
        res.writeHead(400).end('Invalid update');
      }
    });
    return;
  }

  // DELETE TASK
  if (req.url?.startsWith('/tasks/') && req.method === 'DELETE') {
    const userId = getUserId(req);
    if (!userId) return res.writeHead(401).end('Unauthorized');
    const id = req.url.split('/')[2];
    Task.findOneAndDelete({ _id: id, userId }).then(deleted => {
      if (!deleted) return res.writeHead(403).end('Not allowed');
      res.writeHead(200).end(JSON.stringify({ message: 'deleted' }));
    }).catch(() => {
      res.writeHead(400).end(JSON.stringify({ error: 'Bad id' }));
    });
    return;
  }

  res.writeHead(404).end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => console.log(`🟢 Server running on http://localhost:${PORT}`));
