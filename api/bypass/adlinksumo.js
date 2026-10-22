const { fetchTheresav } = require('../../lib/theresav.js');
module.exports = async (req, res) => {
  try { res.status(200).json(await fetchTheresav('/api/bypass/adlinksumo', { url: req.body.url })); } 
  catch (e) { res.status(500).json({ error: e.message }); }
};
