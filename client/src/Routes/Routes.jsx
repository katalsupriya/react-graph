import {createBrowserRouter} from "react-router-dom";
import Layout from "../layout/Layout";
import Home from '../pages/Home/Home';
import TestSelection from "../pages/TestSelection/TestSelection";

async function testSelectionData(){
 const profiles = await fetch('/get/profiles').then(response=>response.json());
 const norma = await fetch('/get/normaapl').then(response=>response.json());
 const normaRazi = await fetch('/get/normarazi').then(response=>response.json());

  return Promise.all([profiles,norma,normaRazi]);
}


export  const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      {
        path:'/',
        index: true,
        Component: Home,
        loader: async () => {return await fetch('/get/candidates').then(response=>response.json()).then(data=>data[0].response).catch(e=>console.log(e))}
      },
      {
        path:'test-selection',
        index: true,
        Component: TestSelection,
        loader: async () => {return await testSelectionData().then(data=>data).catch(e=>console.log(e))}
      },
    ],
  },
]);


