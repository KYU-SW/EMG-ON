import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Prepare from "./pages/Prepare";
import Live from "./pages/Live";
import Result from "./pages/Result";
import History from "./pages/History";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/prepare" element={<Prepare />} />
          <Route path="/live" element={<Live />} />
          <Route path="/result" element={<Result />} />
          <Route path="/history" element={<History />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}