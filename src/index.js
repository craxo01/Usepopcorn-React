import React, { use, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'
import App from './App';
import StarRating from './starrating';
/*function Test(){
  const [movie,setmovie]=useState(0)
  return(
    <div>
      <StarRating color={'blue'}  setmovie={setmovie}/>
      <p>this movie rating is {movie}</p>
    </div>
  )
}*/
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
   <App/>
  </React.StrictMode>
);

