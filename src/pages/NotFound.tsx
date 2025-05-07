
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cp-cream to-white">
      <div className="text-center p-6">
        <h1 className="text-6xl font-bold text-cp-green-700 mb-4">404</h1>
        <p className="text-xl text-cp-neutral-700 mb-6">
          Oops! Page not found
        </p>
        <Button 
          onClick={() => navigate('/')}
          className="gradient-green hover:opacity-90"
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
