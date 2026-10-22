const axios = require('axios');

const API_KEYS = [
  '04i97',
  'otnHv',
  'pHM3M'
];
let keyIndex = 0;

async function fetchTheresav(endpoint, params) {
  if (API_KEYS.length === 0) throw new Error('API Key tidak tersedia.');
  
  for (let i = 0; i < API_KEYS.length; i++) {
    const currentKey = API_KEYS[keyIndex];
    try {
      const res = await axios.get(`https://api.theresav.eu${endpoint}`, {
        params: params,
        headers: { 'x-apikey': currentKey },
        timeout: 30000
      });
      
      // Timpa creator dari API dengan AlcaW44
      const data = res.data;
      data.creator = 'AlcaW44';
      data.saluran = 'https://whatsapp.com/channel/0029Vb82nkLEwEjtLSQ49I44';

      return data;
    } catch (err) {
      if (err.response && [401, 403, 429].includes(err.response.status)) {
        keyIndex = (keyIndex + 1) % API_KEYS.length;
        continue; 
      }
      throw new Error(err.response?.data?.message || err.message);
    }
  }
  throw new Error('Semua API Key telah mencapai limit atau tidak valid.');
}

module.exports = { fetchTheresav };
