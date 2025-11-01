import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './styles.css'
import App from './App'
import Home from './pages/Home'
import Development from './pages/Development'
import Execution from './pages/Execution'

const router = createBrowserRouter([
  { path:'/', element:<App/>, children:[
    { index:true, element:<Home/> },
    { path:'development', element:<Development/> },
    { path:'execution', element:<Execution/> },
  ]}
])
createRoot(document.getElementById('root')).render(<RouterProvider router={router} />)
