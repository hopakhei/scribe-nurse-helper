
import { HomeIcon, Shield, Users } from "lucide-react";
import Index from "./pages/Index";
import Patients from "./pages/Patients";
import Auth from "./pages/Auth";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const navItems = [
  {
    title: "Patient List",
    to: "/",
    icon: <Users className="h-4 w-4" />,
    page: <ProtectedRoute><Patients /></ProtectedRoute>,
  },
  {
    title: "Patient Assessment",
    to: "/assessment/:patientId",
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
