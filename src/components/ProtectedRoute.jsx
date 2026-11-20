import { Navigate } from "react-router-dom";
import { loadLastResult } from "../utils/storage";

// Halaman hasil cuma bisa dibuka kalau sudah ada sesi game yang selesai.
export default function ProtectedRoute({ children }) {
  return loadLastResult() ? children : <Navigate to="/library" replace />;
}
