import { Route, Routes } from "react-router-dom";
import { BoardPage } from "./pages/BoardPage";
import { WirePage } from "./pages/WirePage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<BoardPage />} />
      <Route path="/feeds/:id" element={<WirePage />} />
    </Routes>
  );
}
