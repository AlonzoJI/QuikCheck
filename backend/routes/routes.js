const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const router = express.Router();

// TikTok transcription endpoint
router.post('/tiktok-transcript', (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ success: false, error: 'URL is required' });
  }
  
  // Point to the Python script in the app folder
  const scriptPath = path.join(__dirname, '../app/linkVerification.py');
  const command = `python3 ${scriptPath} "${url}"`;
  
  exec(command, { timeout: 60000 }, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ 
        success: false, 
        error: `Script execution failed: ${error.message}` 
      });
    }
    
    try {
      const result = JSON.parse(stdout);
      res.json(result);
    } catch (parseError) {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to parse Python script output' 
      });
    }
  });
});

module.exports = router;
