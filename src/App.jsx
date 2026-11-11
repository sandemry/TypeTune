import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Songs from './pages/Songs';
import GameSettings from './pages/GameSettings';
import TypingTest from './pages/TypingTest';
import Result from './pages/Result';
import History from './pages/History';
import LyricsSync from './pages/LyricsSync';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="page-shell">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/songs" element={<Songs />} />
          <Route path="/settings" element={<GameSettings />} />
          <Route path="/play" element={<TypingTest />} />
          <Route path="/result" element={<Result />} />
          <Route path="/history" element={<History />} />
          <Route path="/sync" element={<LyricsSync />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="footer">made with music & a little bit of purple ✿</footer>
    </>
  );
}
