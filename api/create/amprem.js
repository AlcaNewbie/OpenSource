const { sendLink, verifyLink } = require('../../lib/amprem.js');
module.exports = async (req, res) => {
  try {
    const { stage, email, magicLink } = req.body;
    if (stage.startsWith('1')) { res.status(200).json(await sendLink(email)); } 
    else { res.status(200).json(await verifyLink(email, magicLink)); }
  } catch (e) { res.status(500).json({ error: e.message }); }
};
