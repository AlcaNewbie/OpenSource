const { bypassVplink } = require('../../lib/vplink.js');
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try { res.status(200).json(await bypassVplink(req.body.url)); } 
  catch (e) { res.status(500).json({ error: e.message }); }
};