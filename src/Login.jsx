import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    Name: '',
    Password: ''
  });

  const apiUrl = import.meta.env.VITE_API_URL;
    const userName = import.meta.env.VITE_USERNAME;
    const Password = import.meta.env.VITE_PASSWORD;

    console.log('API URL:', apiUrl);
    console.log('Username:', userName);
    console.log('Password:', Password);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const jsonData = {
    "Loginid": formData.Name,
    "Ad": formData.Password,
    "Bolumno": "",
    "Altbolumno": "",
    "Werks": "",
    "Konum": "",
    "Ozel": "",
    "Profil": "",
    "Mail": "",
    "Web": false,
    "Bom": false,
    "Kodac": false
};

//GET İŞLEMİ TOKEN ALMAK İÇİN


  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(JSON.stringify(jsonData));
    const url = '/sap/opu/odata/EGBS/PC_SRV/LoginSet';

    const fetchCSRFToken = async () => {
      try {
        //console.log(csrfRequestUrl)
        const csrfResponse = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': 'Basic ' +  btoa(userName + ':' + Password),
            'x-csrf-token': 'fetch'
          },
          credentials: 'include'  // Oturum bilgilerini paylaş
           
        });
      
        
        if (csrfResponse.ok) {
          console.log(url);
          const csrfToken = csrfResponse.headers.get('x-csrf-token');  // Token'ı yanıt başlıklarından alıyoruz
          console.log("token : " + csrfToken);
          return{csrfToken};
        } else {
          console.error('CSRF token alınamadı.');
          return null;
        }
      } catch (err) {
        console.error('CSRF token alma hatası:', err);
        return null;
      }
    };

    const csrfData = await fetchCSRFToken();
    console.log("alınamadı",csrfData);
    if (!csrfData || !csrfData.csrfToken) {
      alert('CSRF token alınamadı, form gönderilemedi.');
      return;
    }
  
    const csrfToken = csrfData.csrfToken;
    const urlpost = '/sap/opu/odata/EGBS/PC_SRV/LoginSet';

    try {
      const response = await fetch(urlpost, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'x-csrf-token': csrfToken, 
          },
          body: JSON.stringify(jsonData)
      });

      if (response.ok) {
          // Yanıt XML olarak döneceği için text formatında alıyoruz
          const responseText = await response.text();

          // DOMParser ile XML yanıtını parse et
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(responseText, 'application/xml');

          // 'Mail' alanındaki hatayı veya mesajı bulalım
          const mailNode = xmlDoc.getElementsByTagName('d:Mail')[0];
          const mailMessage = mailNode ? mailNode.textContent : 'Mail mesajı bulunamadı';

          const bölümNode = xmlDoc.getElementsByTagName('d:Bolumno')[0];
          const bölümMessage = bölümNode ? bölümNode.textContent : 'Bolumno mesajı bulunamadı';

          const altNode = xmlDoc.getElementsByTagName('d:Altbolumno')[0];
          const altMessage = altNode ? altNode.textContent : 'Altbolumno mesajı bulunamadı';

          // Konsola 'Mail' alanındaki mesajı yazdır
          console.log(`Mail alanından dönen mesaj: ${mailMessage}`);
          console.log(bölümMessage);
          console.log(altMessage);

          if(mailMessage === ''){
            navigate('/table', {
              state: {
                bolumno: bölümMessage,
                altbolumno: altMessage,
              }
            });
          }else{
            alert(`Mesaj: ${mailMessage}`);
          }
          //navigate('/table');
          
          onLogin(formData.Name, formData.Password);
      } else {
          setError('Kullanıcı adı veya şifre hatalı');
      }
    } catch (error) {
          console.error('Login error:', error);      
    }
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h2>Login</h2>

      <label htmlFor="name">Name:</label>
      <input
        type="text"
        name="Name"
        value={formData.Name}
        onChange={handleChange}
      />
    
      <label id="password">Password:</label>
      <input
        type="password"
        name="Password"
        value={formData.Password}
        onChange={handleChange}
      />

      <button type="submit">Giriş</button>
    </form>
  );
}

export default Login;
