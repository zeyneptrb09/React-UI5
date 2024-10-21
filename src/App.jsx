import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import Login from './Login'; // Login bileşeni import edilmeli
import DataGridPage from './DataGridPage'; // Tablo bileşenini barındıracak dosya



function App() {
  const [userCredentials, setUserCredentials] = useState({
    username: '',
    password: ''
  });

  const handleLogin = (username, password) => {
    // Kullanıcı bilgilerini state'e kaydediyoruz
    setUserCredentials({
      username: username,
      password: password
    });
  };

  return (
    <Router>
    <Routes>
      {/* Login bileşenine handleLogin fonksiyonunu props olarak gönderiyoruz */}
      <Route path="/" element={<Login onLogin={handleLogin} />} />
      {/* DataGridPage'e de kullanıcı adı ve şifre bilgilerini props olarak geçiyoruz */}
      <Route path="/table" element={<DataGridPage username={userCredentials.username} password={userCredentials.password} />} />
    </Routes>
  </Router>
  );
}

export default App
