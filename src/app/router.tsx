import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/Layout";
import Home from "../pages/Home";
import BookDetail from "../pages/BookDetail";
import Favorites from "../pages/Favorites";
import Read from "../pages/Read";


export const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            { index: true, element: <Home /> },
            { path: "book/:workId", element: <BookDetail /> },
            { path: "favorites", element: <Favorites /> },
            { path: "read", element: <Read /> },
        ],
    },
]);
