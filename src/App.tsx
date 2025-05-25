import { useState, useEffect } from 'react';
import './App.css';
import Login from './login';
import Register from './register';
import Navbar from './Navbar';

interface Task {
  _id: string;
  text: string;
  dueDate?: string;
  dueTime?: string;
  createdAt: number;
  category?: string;
  completed?: boolean;
}

export default function App() {
  const isLoggedIn = !!localStorage.getItem('token');
  const [loggedIn, setLoggedIn] = useState(isLoggedIn);
  const [showLogin, setShowLogin] = useState(true); // 👈 האם להציג login או register
  const [task, setTask] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [category, setCategory] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'created'>('date');
  const [editId, setEditId] = useState<string | null>(null);

  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  useEffect(() => {
    document.body.className = dark ? 'dark' : '';
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const loadTasks = async () => {
    const res = await fetch('http://localhost:3000/tasks', { headers });
    if (!res.ok) return;
    const data: Task[] = await res.json();
    setTasks(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) return;

    const payload = {
      text: task,
      dueDate,
      dueTime,
      category: category.trim() || undefined,
      completed: false,
    };

    const method = editId === null ? 'POST' : 'PUT';
    const url = editId === null
      ? 'http://localhost:3000/tasks'
      : `http://localhost:3000/tasks/${editId}`;

    await fetch(url, {
      method,
      headers,
      body: JSON.stringify(payload),
    });

    resetForm();
    loadTasks();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const resetForm = () => {
    setTask('');
    setDueDate('');
    setDueTime('');
    setCategory('');
    setEditId(null);
  };

  const deleteTask = async (id: string) => {
    await fetch(`http://localhost:3000/tasks/${id}`, { method: 'DELETE', headers });
    if (editId === id) resetForm();
    loadTasks();
    setShowDelete(true);
    setTimeout(() => setShowDelete(false), 2000);
  };

  const deleteCompletedTasks = async () => {
    const completed = tasks.filter(t => t.completed);
    await Promise.all(
      completed.map(t =>
        fetch(`http://localhost:3000/tasks/${t._id}`, { method: 'DELETE', headers })
      )
    );
    loadTasks();
  };

  const toggleCompleted = async (task: Task) => {
    const updated = { ...task, completed: !task.completed };
    await fetch(`http://localhost:3000/tasks/${task._id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updated),
    });
    loadTasks();
  };

  useEffect(() => {
    if (loggedIn) loadTasks();
  }, [loggedIn]);

  if (!loggedIn) {
    return (
      <>
        {showLogin ? (
          <>
            <Login onSuccess={() => setLoggedIn(true)} />
            <p style={{ textAlign: 'center' }}>
              Don't have an account? <button onClick={() => setShowLogin(false)}>Register</button>
            </p>
          </>
        ) : (
          <>
            <Register />
            <p style={{ textAlign: 'center' }}>
              Already have an account? <button onClick={() => setShowLogin(true)}>Login</button>
            </p>
          </>
        )}
      </>
    );
  }

  const display = [...tasks]
    .filter((t) =>
      (!filterCategory || t.category === filterCategory) &&
      (!searchText || t.text.toLowerCase().includes(searchText.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'created') return a.createdAt - b.createdAt;
      const aMs = a.dueDate && a.dueTime ? Date.parse(`${a.dueDate}T${a.dueTime}`) : Infinity;
      const bMs = b.dueDate && b.dueTime ? Date.parse(`${b.dueDate}T${b.dueTime}`) : Infinity;
      return aMs - bMs;
    });

  const categories = Array.from(new Set(tasks.map(t => t.category).filter(Boolean)));

  return (
    <div>
      <Navbar onLogout={() => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setLoggedIn(false);
      }} />

      <div style={{ textAlign: 'center', margin: '10px' }}>
        <button className="btn btn-secondary" onClick={() => setDark(!dark)}>
          {dark ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      {showSuccess && <div className="popup success">✅ Task added successfully!</div>}
      {showDelete && <div className="popup danger">❌ Task deleted!</div>}

      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <button className="btn btn-danger" onClick={deleteCompletedTasks}>
          Delete Completed Tasks 🧹
        </button>
      </div>

      <form className="task-form" onSubmit={handleSubmit}>
        <input placeholder="Task..." value={task} onChange={e => setTask(e.target.value)} />
        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        <input type="time" value={dueTime} onChange={e => setDueTime(e.target.value)} />
        <input placeholder="Category (optional)" value={category} onChange={e => setCategory(e.target.value)} />
        <button className="btn btn-primary" type="submit">
          {editId === null ? 'Add' : 'Update'}
        </button>
        {editId !== null && (
          <button type="button" onClick={resetForm} className="btn btn-secondary">
            Cancel
          </button>
        )}
      </form>

      <div className="sort-wrap">
        <label>Sort by:</label>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
          <option value="date">Due Date + Time</option>
          <option value="created">Order Added</option>
        </select>

        <label> | Category:</label>
        <select onChange={e => setFilterCategory(e.target.value || null)}>
          <option value="">All</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <label> | Search:</label>
        <input
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <ul className="task-list">
        {display.map(t => (
          <li key={t._id} data-id={t._id} className={`task-card ${t.completed ? 'completed' : ''}`}>
            <span>
              <input type="checkbox" checked={!!t.completed} onChange={() => toggleCompleted(t)} />
              <span className="task-title">{t.text}</span>
              {(t.dueDate || t.dueTime) && (
                <span className="task-meta"> (Due: {t.dueDate ?? '—'} {t.dueTime ?? ''})</span>
              )}
              {t.category && <> | <em>{t.category}</em></>}
            </span>
            <span className="inline-actions">
              <button className="btn btn-secondary" onClick={() => {
                setTask(t.text);
                setDueDate(t.dueDate ?? '');
                setDueTime(t.dueTime ?? '');
                setCategory(t.category ?? '');
                setEditId(t._id);
              }}>
                ✏️ Edit
              </button>
              <button className="btn btn-danger" onClick={() => deleteTask(t._id)}>
                ❌ Delete
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
