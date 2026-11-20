import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "../components/Navbar";

// Cover, landing page, daftar lagu, dan 404. Tema: langit senja di atas ladang lavender.
export default function PublicLayout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="pub">
      <Navbar />
      <main className="pub-main">
        <Outlet />
      </main>
      <footer className="pub-footer">
        <div className="wrap pub-footer-inner">
          <span className="pub-footer-brand">typetune</span>
          <span>Type the lyrics. Run the music.</span>
        </div>
      </footer>
    </div>
  );
}
