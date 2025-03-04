import { Toaster } from "react-hot-toast";
import Navbar from "./Navbar";
import Content from "./content/Content";
function App() {
  return (
    <div>
      <Navbar />
      <Content />
      <Toaster position="top-center" />
    </div>
  );
}

export default App;
