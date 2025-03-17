const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { analyzePost } = require('./ai-analysis');

// Directory to store incoming posts
const POSTS_DIR = path.join(__dirname, 'data/posts');

// Ensure the posts directory exists
async function ensureDirectoryExists() {
  try {
    await fs.mkdir(POSTS_DIR, { recursive: true });
    console.log('Posts directory created or already exists');
  } catch (error) {
    console.error('Error creating posts directory:', error);
  }
}

ensureDirectoryExists();

// Helper to store a post
async function storePost(source, content, metadata = {}) {
  try {
    const timestamp = new Date().toISOString();
    const filename = `${timestamp.replace(/:/g, '-')}_${source}.json`;
    
    const postData = {
      source,
      content,
      timestamp,
      metadata,
      analyzed: false
    };
    
    await fs.writeFile(
      path.join(POSTS_DIR, filename), 
      JSON.stringify(postData, null, 2)
    );
    
    console.log(`Stored ${source} post: ${filename}`);
    
    // Process the post with AI
    try {
      const analysis = await analyzePost(postData);
      // Store the analysis results
      postData.analysis = analysis;
      postData.analyzed = true;
      await fs.writeFile(
        path.join(POSTS_DIR, filename), 
        JSON.stringify(postData, null, 2)
      );
      console.log(`Analyzed ${source} post: ${filename}`);
      
      return { success: true, filename, analysis };
    } catch (analysisError) {
      console.error(`Error analyzing post: ${analysisError.message}`);
      return { success: true, filename, error: 'Analysis failed' };
    }
  } catch (error) {
    console.error(`Error storing ${source} post:`, error);
    return { success: false, error: error.message };
  }
}

// Twitter/X webhook
router.post('/webhook/twitter', async (req, res) => {
  try {
    const { text, user, id_str, created_at } = req.body;
    
    if (!text) {
      return res.status(400).json({ success: false, error: 'Missing tweet content' });
    }
    
    const result = await storePost('twitter', text, {
      user: user?.screen_name || 'unknown',
      tweetId: id_str,
      createdAt: created_at
    });
    
    return res.json(result);
  } catch (error) {
    console.error('Error processing Twitter webhook:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Discord webhook
router.post('/webhook/discord', async (req, res) => {
  try {
    const { content, author, channel_id, guild_id } = req.body;
    
    if (!content) {
      return res.status(400).json({ success: false, error: 'Missing message content' });
    }
    
    const result = await storePost('discord', content, {
      author: author?.username || 'unknown',
      channelId: channel_id,
      guildId: guild_id
    });
    
    return res.json(result);
  } catch (error) {
    console.error('Error processing Discord webhook:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Generic webhook for testing
router.post('/webhook/test', async (req, res) => {
  try {
    const { content, source = 'test' } = req.body;
    
    if (!content) {
      return res.status(400).json({ success: false, error: 'Missing content' });
    }
    
    const result = await storePost(source, content, req.body);
    return res.json(result);
  } catch (error) {
    console.error('Error processing test webhook:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get all processed insights
router.get('/insights', async (req, res) => {
  try {
    const files = await fs.readdir(POSTS_DIR);
    const insights = [];
    
    for (const file of files) {
      try {
        const content = await fs.readFile(path.join(POSTS_DIR, file), 'utf8');
        const post = JSON.parse(content);
        
        if (post.analyzed && post.analysis && post.analysis.insights) {
          insights.push(...post.analysis.insights);
        }
      } catch (error) {
        console.error(`Error reading file ${file}:`, error);
      }
    }
    
    // Sort by confidence (highest first)
    insights.sort((a, b) => b.confidence - a.confidence);
    
    return res.json({ success: true, insights });
  } catch (error) {
    console.error('Error getting insights:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
