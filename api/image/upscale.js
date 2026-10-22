const { upscale } = require('../../lib/rezolve.js');
module.exports = async (req, res) => {
  try { res.status(200).json(await upscale(req.body.url, req.body.multiplier)); } 
  catch (e) { res.status(500).json({ error: e.message }); }
};
