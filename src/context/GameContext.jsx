import { createContext, useContext, useState } from 'react';
import { songs } from '../data/songs';

const GameContext = createContext(null);

const defaultSettings = {
  speed: 1,
  duration: '2',
  section: 'beginning',
  customStart: 0,
  customEnd: 60,
  missLimit: 5
};

export function GameProvider({ children }) {
  const [selectedSong, setSelectedSong] = useState(songs[0]);
  const [settings, setSettings] = useState(defaultSettings);
  const [latestResult, setLatestResult] = useState(null);

  return (
    <GameContext.Provider value={{
      selectedSong, setSelectedSong,
      settings, setSettings,
      latestResult, setLatestResult
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame harus digunakan di dalam GameProvider');
  return context;
}
