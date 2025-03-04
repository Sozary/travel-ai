import { MainLayout } from "./layouts/MainLayout";
import { HomePage } from "./pages/HomePage";
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <MainLayout>
      <HomePage />
      <Toaster position="top-center" />
    </MainLayout>
  );
}

export default App;
