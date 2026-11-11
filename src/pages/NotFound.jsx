import { Link } from 'react-router-dom';
export default function NotFound() {
  return <div className="empty-state"><h1>Oops! Page not found.</h1><Link className="button" to="/">Back home</Link></div>;
}
