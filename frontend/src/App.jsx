import { createBrowserRouter, RouterProvider } from "react-router"
import Dashboard from "./pages/Dashboard" 
import AddPassword from "./pages/AddPassword";
import Login from "./pages/Login";

const router = createBrowserRouter([
	{
		path: "/",
		element: <Login/>,
	},
	{
		path: '/app',
		element: <Dashboard />,
	}, 
	{
		path: '/addpassword',
		element: <AddPassword />,
	},
]);

function App() {
	return <RouterProvider router={router} />;
}

export default App
