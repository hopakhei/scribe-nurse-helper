
import React from 'react';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { navItems } from "./nav-items";
import { Toaster } from "@/components/ui/sonner";

const router = createBrowserRouter(
  navItems.map(({ to, page }) => ({
    path: to,
    element: page,
  }))
);

const App = () => (
  <div id="app-root">
    <RouterProvider router={router} />
    <Toaster position="bottom-right" />
  </div>
);

export default App;
