const axios = require('axios');
async function sendLink(email) {
  const res = await axios.post('https://satriam.satriadeveloperz.workers.dev/api/satriam/send-link', { email });
  return { creator: 'AlcaW44', saluran: 'https://whatsapp.com/channel/0029Vb82nkLEwEjtLSQ49I44', ...res.data };
}
async function verifyLink(email, magicLink) {
  const res = await axios.post('https://satriam.satriadeveloperz.workers.dev/api/satriam/verify-link', { email, magicLink });
  return { creator: 'AlcaW44', saluran: 'https://whatsapp.com/channel/0029Vb82nkLEwEjtLSQ49I44', ...res.data };
}
module.exports = { sendLink, verifyLink };
