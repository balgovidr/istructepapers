import './App.css';
import Navbar from './components/navbar.js';
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Home from './pages/home';
import SignUp from './pages/signUp';
import Login from './pages/login';
import UploadPaper from './pages/uploadPaper';
import Filter from './pages/filter';
import Viewer from './pages/viewer';
import Surveys from './pages/surveys';
import ForgotPassword from './pages/forgotPassword';
import Content from './pages/content';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/upload",
    element: <UploadPaper />,
  },
  {
    path: "/content",
    element: <Content />,
  },
  {
    path: "/filter",
    element: <Filter />,
  },
  {
    path: "/viewer",
    element: <Viewer />,
  },
  {
    path: "/surveys",
    element: <Surveys />,
  },
]);

function App() {
  return (

    <div className="App">
      <Navbar/>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
