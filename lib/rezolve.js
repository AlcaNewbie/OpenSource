const axios = require('axios'); const FormData = require('form-data');
async function upscale(imageSource, multiplier = '2') {
  try {
    let buffer;
    if (imageSource.startsWith('data:image')) {
       buffer = Buffer.from(imageSource.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    } else {
       const imgRes = await axios.get(imageSource, { responseType: 'arraybuffer' });
       buffer = Buffer.from(imgRes.data);
    }
    const form = new FormData();
    form.append('file', buffer, { filename: 'image.jpg', contentType: 'image/jpeg' });
    form.append('multiplier', multiplier);
    const res = await axios.post('https://rezolve.my.id/api/upscale', form, { headers: form.getHeaders() });
    if (res.data.status === 'success') {
      return { status: true, creator: 'AlcaW44', saluran: 'https://whatsapp.com/channel/0029Vb82nkLEwEjtLSQ49I44', image_url: res.data.image };
    }
    throw new Error(res.data.message);
  } catch (e) { return { status: false, error: e.message }; }
}
module.exports = { upscale };
