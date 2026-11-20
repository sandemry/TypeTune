import { Routes, Route } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import PlayLayout from "./layouts/PlayLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Library from "./pages/Library";
import Game from "./pages/Game";
import Result from "./pages/Result";
import NotFound from "./pages/NotFound";

// Dua area, dua tema:
//   PublicLayout : cover, landing, daftar lagu  (langit senja)
//   PlayLayout   : setup, bermain, hasil        (panggung gelap)
export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/library" element={<Library />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route element={<PlayLayout />}>
        <Route path="/play/:songId" element={<Game />} />
        <Route path="/result" element={<ProtectedRoute><Result /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}
