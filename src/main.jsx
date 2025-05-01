import React, { useState ,  createContext} from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import GameBoard from './Pages/GameBoard.jsx'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import HomeScreen from './Pages/HomeScreen.jsx'
import Navbar from './components/navbar.jsx'
import Login from './Pages/login.jsx'
import OnlineMode from './Pages/OnlineMode.jsx'
import Register from './Pages/Register.jsx'
export const ModeContext=createContext();

// Wrapper for /online route to require login
function RequireAuth({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

const App = () => {
  const [mode, setMode] = useState('default');
  return (
    <React.StrictMode>
      <ModeContext.Provider value={{mode, setMode}}>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<HomeScreen />} />
          <Route path='/login' element={<Login />} />
          <Route path='/play' element={<GameBoard />} />
          <Route path='/online' element={
            <RequireAuth>
              <OnlineMode />
            </RequireAuth>
          } />
          <Route path='/register' element={<Register />} />
        </Routes>
      </BrowserRouter>
      </ModeContext.Provider>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
