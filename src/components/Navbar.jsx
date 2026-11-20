import { NavLink } from "react-router-dom";
import RansomWord from "./RansomWord";

export default function Navbar() {
  return (
    <header className="pub-nav">
      <div className="wrap pub-nav-inner">
        <NavLink to="/" className="brand" aria-label="typetune, back to home">
          <RansomWord text="typetune" size="sm" />
        </NavLink>
        <nav className="pub-nav-links" aria-label="Main">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/library">Tracks</NavLink>
        </nav>
      </div>
    </header>
  );
}
