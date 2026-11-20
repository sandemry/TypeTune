import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="band band-tall">
      <div className="wrap">
        <h1>This page left the chat.</h1>
        <p>Whatever you were looking for isn't here.</p>
        <Link to="/" className="btn btn-primary btn-lg band-action">Back to home</Link>
      </div>
    </section>
  );
}
