const { getNetflixTokens } = require('../../lib/netflix.js');
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try { res.status(200).json(await getNetflixTokens(req.body.count || 1)); } 
  catch (e) { res.status(500).json({ error: e.message }); }
};