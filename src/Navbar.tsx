import './Navbar.css';

export default function Navbar({ onLogout }: { onLogout: () => void }) {
  const username = localStorage.getItem('username');

  return (
    <nav className="navbar">
      <span className="logo">📝 Task Manager</span>
      <span style={{ flex: 1 }}></span>
      {username && <span>Hello, <strong>{username}</strong> 👋</span>}
      <button onClick={onLogout}>🚪 Logout</button>
    </nav>
  );
}
