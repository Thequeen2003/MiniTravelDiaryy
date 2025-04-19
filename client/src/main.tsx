import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "@supabase/supabase-js";

createRoot(document.getElementById("root")!).render(<App />);
