import React from 'react'
import { Route, Routes } from 'react-router-dom';
import Home from './Pages/home';
import Upload from './Pages/upload';


function App() {
  return(
    <div>
      <Routes>
        <Route  index path="/" element={<Home />}/>
        <Route path="/upload" element={<Upload />}/>
      </Routes>
    </div>
  )
}

export default App;
