
import { HomeIcon, Shield } from "lucide-react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const navItems = [
  {
    title: "Patient Assessment",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <ProtectedRoute><Index /></ProtectedRoute>,
  },
  {
    title: "Authentication",
    to: "/auth",
    icon: <Shield className="h-4 w-4" />,
    page: <Auth />,
  },
];
