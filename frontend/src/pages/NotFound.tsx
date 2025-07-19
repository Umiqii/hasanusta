
import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-white pt-16">
      <div className="text-center max-w-lg px-4">
        <h1 className="text-6xl font-serif font-bold text-primary-red mb-6">404</h1>
        <h2 className="text-3xl font-serif font-bold mb-4">Sayfa Bulunamadı</h2>
        <p className="text-lg text-gray-600 mb-8">
          Aradığınız sayfa mevcut değil veya kaldırılmış olabilir.
        </p>
        <Link to="/">
          <Button className="bg-primary-red hover:bg-red-700 text-white">
            Ana Sayfaya Dön
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
