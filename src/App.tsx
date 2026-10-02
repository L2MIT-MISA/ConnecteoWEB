import { useEffect, useState } from "react";
import Header from "./components/Header/Header";
import Home from "./pages/Home/Home";
import SearchPage from "./pages/Search/SearchPage";
import DownloadPage from "./pages/Download/DownloadPage";
import About from "./pages/About/About";
import Auth from "./pages/Auth/Auth";

function getCurrentPage() {
  return window.location.hash.replace("#", "") || "pages/Home";
}

function App() {
  const [page, setPage] = useState(getCurrentPage());

  useEffect(() => {
    function handleHashChange() {
      setPage(getCurrentPage());
    }
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  function renderPage() {
    switch (page) {
      case "home":
      case "pages/Home":
        return <Home />;
      case "download":
      case "pages/Download":
        return <DownloadPage />;
      case "pages/Search":
        return <SearchPage />;
      case "pages/Auth":
        return <Auth />;
      case "about":
      case "pages/About":
        return <About />;
      default:
        return <Home />;
    }
  }

  return (
    <>
      <Header />
      {renderPage()}
    </>
  );
}

export default App;