import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";

// Halaman bermain dan hasil. Tema: panggung gelap tanpa navbar dan footer supaya fokus.
export default function PlayLayout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="play">
      <main className="play-main">
        <Outlet />
      </main>
    </div>
  );
}
