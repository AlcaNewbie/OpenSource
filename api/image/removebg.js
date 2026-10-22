const axios = require('axios'); const FormData = require('form-data');
module.exports = async (req, res) => {
  try {
    const img = await axios.get(req.body.url, { responseType: 'arraybuffer' });
    const form = new FormData();
    form.append('image', Buffer.from(img.data), 'image.jpg');
    const response = await axios.post('https://api.theresav.eu/api/image/magichour/removebg', form, { headers: { ...form.getHeaders(), 'x-apikey': '04i97' } });
    res.status(200).json({ creator: 'AlcaW44', saluran: 'https://whatsapp.com/channel/0029Vb82nkLEwEjtLSQ49I44', ...response.data });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
