import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="navbar">
      <NavLink to="/" className="brand">TypeTune <span>✿</span></NavLink>
      <nav>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/songs">Songs</NavLink>
        <NavLink to="/history">History</NavLink>
      </nav>
    </header>
  );
}
