import { createBrowserRouter, RouterProvider } from "react-router"
import Dashboard from "./pages/Dashboard" 
import AddPassword from "./pages/AddPassword";

const router = createBrowserRouter([
  {
    path: '/',
    element: <Dashboard />,
  }, 
  {
    path: '/addpassword',
    element: <AddPassword />,
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App
