import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ProfileProvider } from './context/ProfileContext'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Envolver o App com o ProfileProvider */}
    <ProfileProvider>
      <App />
    </ProfileProvider>
  </React.StrictMode>
);