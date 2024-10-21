import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import CheckIcon from '@mui/icons-material/Check'; // Onay ikonu
import ClearIcon from '@mui/icons-material/Delete'; // Red ikonu
import Button from "@mui/material/Button";
import './App.css';


  
function DataGridPage({ username, password }) {

    const apiUrl = import.meta.env.VITE_API_URL;
    const userName = import.meta.env.VITE_USERNAME;
    const Password = import.meta.env.VITE_PASSWORD;

    console.log('API URL:', apiUrl);
    console.log('Username:', userName);
    console.log('Password:', Password);

    const location = useLocation();
    const [formDataSet, setFormDataSet] = useState([]); // FormDataSet'i tutmak için state

    const { bolumno, altbolumno } = location.state || {};

    useEffect(() => {
    const fetchData = async () => {
        
    
        try {
            const response = await fetch(`/sap/opu/odata/EGBS/PC_SRV/FormHeaderSet?$filter=(DURUM eq '${bolumno}' and ALTBOLUM eq '${altbolumno}')`, {
                method: 'GET', // Verileri alacağımız için GET metodu kullanıyoruz
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                }
              });
          console.log(response);
          if (response.ok) {
            const data = await response.json();
            

            // Silinen verileri API'den gelen verilerden çıkarıyoruz
            const Data = data.d.results;

            //setFormDataSet(filteredData); // Gelen OData setini state'e kaydediyoruz

            setFormDataSet(Data); // Filtrelenmiş verileri kaydet        
           
            
          } else {
            console.error('Error fetching data:', response.status);
          }
        } catch (error) {
          console.error('Fetch error:', error);
        }
    };
    fetchData(); // useEffect ile veri çekme işlemi tetiklenir
    }, [username, password,bolumno,altbolumno]);


    const handleApprove = async (id) => {
        console.log("Onaylanan satır ID: ", id);
        // Onaylanan satırın verilerini buluyoruz
        const selectedRow = formDataSet.find(item => item.FORMNO === id);

        if (!selectedRow) {
            console.error("Seçilen satır bulunamadı");
            return;
        }

        const { URUNTIPI, FORMNO, REVNO,ISLEM, HAZIRLAYAN_ID } = selectedRow;
        console.log(URUNTIPI,  FORMNO, REVNO, ISLEM, HAZIRLAYAN_ID);

        const Datajson = {
            "URUNTIPI": URUNTIPI,
            "FORMNO": FORMNO, // Form numarası
            "REVNO": REVNO,   // Revizyon numarası
            "ISLEM": 'GERI_AL',   // İşlem türü ('GONDER' veya 'GERI_AL')
            "USER_ID": HAZIRLAYAN_ID, // Kullanıcı ID'si
            "SONUC": '',    // Sonuç durumu
            "ACIKLAMA": '' // Açıklama metni
        };

        const url = '/sap/opu/odata/EGBS/PC_SRV/FormGonderSet';

        

    const fetchCSRFToken = async () => {
      try {
        //console.log(csrfRequestUrl)
        const csrfResponse = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': 'Basic ' + btoa(userName + ':' + Password),
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
    console.log(csrfData);
    if (!csrfData || !csrfData.csrfToken) {
      alert('CSRF token alınamadı, form gönderilemedi.');
      return;
    }
  
    const csrfToken = csrfData.csrfToken;
  
    
    try {
      const response = await fetch(url, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'x-csrf-token': csrfToken, 
          },
          body: JSON.stringify(Datajson)
      });

      if (response.ok) {
        console.log("Satır başarıyla gönderildi");
        console.log(JSON.stringify(Datajson));

        const responseText = await response.text();

        // DOMParser ile XML yanıtını parse et
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(responseText, 'application/xml');

        // 'Mail' alanındaki hatayı veya mesajı bulalım
        const SonucNode = xmlDoc.getElementsByTagName('d:SONUC')[0];
        const SonucMessage = SonucNode ? SonucNode.textContent : 'SONUC mesajı bulunamadı';

        const AcıklamaNode = xmlDoc.getElementsByTagName('d:ACIKLAMA')[0];
        const AcıklamaMessage = AcıklamaNode ? AcıklamaNode.textContent : 'ACIKLAMA mesajı bulunamadı';

       

        // Konsola 'Mail' alanındaki mesajı yazdır
        alert(`sonuc alanından dönen mesaj: ${SonucMessage} ve acıklama alanı mesajı ${AcıklamaMessage}`);
        console.log(SonucMessage);
        console.log(AcıklamaMessage);


        alert("post edildi")
      } else {
          alert("post hatası")
      }
    } catch (error) {
          console.error('Login error:', error);      
    }
  
    };
    

    const handleReject = async (id) => {
        console.log("Onaylanan satır ID: ", id);
        // Onaylanan satırın verilerini buluyoruz
        const selectedRow = formDataSet.find(item => item.FORMNO === id);

        if (!selectedRow) {
            console.error("Seçilen satır bulunamadı");
            return;
        }

        const { URUNTIPI, FORMNO, REVNO,ISLEM, HAZIRLAYAN_ID } = selectedRow;
        console.log(URUNTIPI,  FORMNO, REVNO, ISLEM, HAZIRLAYAN_ID);

        const Datajson = {
            "URUNTIPI": URUNTIPI,
            "FORMNO": FORMNO, // Form numarası
            "REVNO": REVNO,   // Revizyon numarası
            "ISLEM": 'GERI_AL',   // İşlem türü ('GONDER' veya 'GERI_AL')
            "USER_ID": HAZIRLAYAN_ID, // Kullanıcı ID'si
            "SONUC": '',    // Sonuç durumu
            "ACIKLAMA": '' // Açıklama metni
        };

        const url = '/sap/opu/odata/EGBS/PC_SRV/FormGonderSet';

        

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
    console.log(csrfData);
    if (!csrfData || !csrfData.csrfToken) {
      alert('CSRF token alınamadı, form gönderilemedi.');
      return;
    }
  
    const csrfToken = csrfData.csrfToken;
  
    
    try {
      const response = await fetch(url, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'x-csrf-token': csrfToken, 
          },
          body: JSON.stringify(Datajson)
      });

      if (response.ok) {
        console.log("Satır başarıyla gönderildi");
        console.log(JSON.stringify(Datajson));

        const responseText = await response.text();

        // DOMParser ile XML yanıtını parse et
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(responseText, 'application/xml');

        // 'Mail' alanındaki hatayı veya mesajı bulalım
        const SonucNode = xmlDoc.getElementsByTagName('d:SONUC')[0];
        const SonucMessage = SonucNode ? SonucNode.textContent : 'SONUC mesajı bulunamadı';

        const AcıklamaNode = xmlDoc.getElementsByTagName('d:ACIKLAMA')[0];
        const AcıklamaMessage = AcıklamaNode ? AcıklamaNode.textContent : 'ACIKLAMA mesajı bulunamadı';

       

        // Konsola 'Mail' alanındaki mesajı yazdır
        alert(`sonuc alanından dönen mesaj: ${SonucMessage} ve acıklama alanı mesajı ${AcıklamaMessage}`);
        console.log(SonucMessage);
        console.log(AcıklamaMessage);


        
      } else {
          alert("post hatası")
      }
    } catch (error) {
          console.error('Login error:', error);      
    }
  
    };
    


    const columns = [
        {
            field: 'actions',
            headerName: 'İşlemler',
            width: 200,
            renderCell: (params) => (
                <div>
                    <button
                        onClick={() => handleApprove(params.id)}
                        style={{
                            backgroundColor: 'green', // Butonun arka plan rengini yeşil yap
                            color: 'white', // Yazı rengini beyaz yap
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            marginRight: 10,
                        }}
                    >
                        <CheckIcon style={{ color: 'white' }} /> {/* Onay ikonu */}
                        Onay
                    </button>
                    <button
                        onClick={() => handleReject(params.id)}
                        style={{
                            backgroundColor: 'red', // Butonun arka plan rengini kırmızı yap
                            color: 'white', // Yazı rengini beyaz yap
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                        }}
                    >
                        <ClearIcon style={{ color: 'white' }} /> {/* Red ikonu */}
                        Ret
                    </button>
                </div>
            ),
        },

        { field: 'URUNTIPI', headerName: 'Ürün Tipi', width: 150 },
        { field: 'FORMNO', headerName: 'Form No', width: 150 },
        { field: 'REVNO', headerName: 'Revizyon No', width: 120 },
        { field: 'YAPI', headerName: 'Yapı', width: 150 },
        { field: 'URUNKODU', headerName: 'Ürün Kodu', width: 150 },
        { field: 'TARIH', headerName: 'Tarih', width: 150 },
        { field: 'MUSTERI_NO', headerName: 'Müşteri No', width: 150 },
        { field: 'TAHSEVK_TARIHI', headerName: 'Tahmini Sevk Tarihi', width: 180 },
        { field: 'ULKENO', headerName: 'Ülke No', width: 100 },
        { field: 'ISLEM', headerName: 'İşlem', width: 150 },
        { field: 'DURUM_ONCEKI', headerName: 'Durum Önceki', width: 150 },
        { field: 'ALTBOLUM_ONCEKI', headerName: 'Alt Bölüm Önceki', width: 150 },
        { field: 'DURUM', headerName: 'Durum', width: 100 },
        { field: 'ALTBOLUM', headerName: 'Alt Bölüm', width: 150 },
        { field: 'HAZIRLAYAN_ID', headerName: 'Hazırlayan ID', width: 150 },
        { field: 'HAZIRLAYAN_ADI', headerName: 'Hazırlayan Adı', width: 150 },
        { field: 'TANIM', headerName: 'TANIM', width: 150 },
        
    ];
    
    const rows = formDataSet.map((item, index) => ({
        id: item.FORMNO,
        URUNTIPI: item.URUNTIPI,
        FORMNO: item.FORMNO,
        REVNO: item.REVNO,
        YAPI: item.YAPI,
        URUNKODU: item.URUNKODU,
        TARIH: item.TARIH,
        MUSTERI_NO: item.MUSTERI_NO,
        TAHSEVK_TARIHI: item.TAHSEVK_TARIHI,
        ULKENO: item.ULKENO,
        ISLEM: item.ISLEM,
        DURUM_ONCEKI: item.DURUM_ONCEKI,
        ALTBOLUM_ONCEKI: item.ALTBOLUM_ONCEKI,
        DURUM: item.DURUM,
        ALTBOLUM: item.ALTBOLUM,
        HAZIRLAYAN_ID: item.HAZIRLAYAN_ID,
        HAZIRLAYAN_ADI: item.HAZIRLAYAN_ADI,
        TANIM: item.TANIM
    }));
    

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        checkboxSelection
      />
    </div>
  );
}

export default DataGridPage;
