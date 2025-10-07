const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const FactCheckService = require('../utils/factCheckService');
const VerificationModel = require('../models/verificationModel');
const router = express.Router();

// TikTok transcription endpoint (existing code with caching)
router.post('/tiktok-transcript', async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ success: false, error: 'URL is required' });
  }
  
  try {
    // Check cache first
    const cached = await VerificationModel.getCachedVerification(url);
    if (cached) {
      return res.json({
        success: true,
        cached: true,
        ...cached.verification_result
      });
    }
    
    // If not cached, run transcription
    const scriptPath = path.join(__dirname, '../app/linkVerification.py');
    const command = `python3 ${scriptPath} "${url}"`;
    
    exec(command, { timeout: 60000 }, async (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({ 
          success: false, 
          error: `Script execution failed: ${error.message}` 
        });
      }
      
      try {
        const result = JSON.parse(stdout);
        
        // Cache the result if successful
        if (result.success) {
          await VerificationModel.createVerificationCache({
            url: url,
            content_extracted: result.transcript_text || '',
            verification_result: result,
            truth_score: null, // We'll add scoring later
            sources: []
          });
        }
        
        res.json(result);
      } catch (parseError) {
        res.status(500).json({ 
          success: false, 
          error: 'Failed to parse Python script output' 
        });
      }
    });
  } catch (dbError) {
    console.error('Database error:', dbError.message);
    // Continue without cache if database fails
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
  }
});

// Fact check endpoint (existing code)
router.post('/fact-check', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ success: false, error: 'Text is required' });
    }
    
    const factCheckResults = await FactCheckService.verifyTranscript(text);
    
    // Calculate simple truth score based on fact-check results
    let truthScore = 50; // Neutral starting point
    if (factCheckResults.length > 0) {
      const falseRatings = factCheckResults.filter(r => 
        r.factChecks.some(fc => fc.textualRating?.toLowerCase().includes('false'))
      ).length;
      
      if (falseRatings > 0) {
        truthScore = Math.max(10, 50 - (falseRatings * 20)); // Lower score for false claims
      }
    }
    
    const result = {
      success: true,
      originalText: text,
      factCheckResults: factCheckResults,
      truthScore: truthScore,
      summary: {
        totalClaims: factCheckResults.length,
        verifiedClaims: factCheckResults.filter(r => r.factChecks.length > 0).length,
        truthScore: truthScore
      }
    };
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Basic test route
router.get('/test', (req, res) => {
  res.json({ message: 'Verify route is working!' });
});

module.exports = router;
