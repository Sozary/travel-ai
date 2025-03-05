import { useState, useEffect } from "react";
import { MainLayout } from "./layouts/MainLayout";
import { HomePage } from "./pages/HomePage";
import { Toaster } from 'react-hot-toast';

function App() {
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const storedKey = localStorage.getItem("openai_api_key");
    if (storedKey) {
      setApiKey(storedKey);
    } else {
      requestApiKey();
    }
  }, []);

  const requestApiKey = () => {
    const key = prompt("Please enter your OpenAI API Key:");
    if (key) {
      localStorage.setItem("openai_api_key", key);
      setApiKey(key);
    } else {
      alert("An API key is required to use this application.");
    }
  };

  if (!apiKey) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <MainLayout>
      <HomePage />
      <Toaster position="top-center" />
    </MainLayout>
  );
}

export default App;
