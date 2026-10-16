import { Dashboard } from "@/pages/dashboard-page/";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
]);

export function AppRoutes() {
  return <RouterProvider router={router} />;
}
