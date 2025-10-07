const express = require('express');
const axios = require('axios');
const NewsModel = require('../models/newsModel');
const router = express.Router();

// Helper function to create different summary lengths
function createSummaryLengths(description, content) {
  const brief = description ? description.substring(0, 100) + '...' : '';
  const standard = description || '';
  const detailed = content ? 
    (content.length > 500 ? content.substring(0, 500) + '...' : content) : 
    description || '';
  
  return { brief, standard, detailed };
}

// GET /api/news/daily - Fetch and store daily news with summary lengths
router.get('/daily', async (req, res) => {
  try {
    console.log('Fetching news from NewsAPI...');
    
    const response = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        country: 'us',
        pageSize: 15,
        apiKey: process.env.NEWS_API_KEY
      }
    });
    
    const articles = [];
    
    for (const article of response.data.articles) {
      if (article.title && article.description) {
        try {
          // Create different summary lengths
          const summaries = createSummaryLengths(
            article.description, 
            article.content
          );
          
          const savedArticle = await NewsModel.createArticle({
            title: article.title,
            summary: article.description,
            original_content: article.content || article.description,
            source: article.source.name,
            url: article.url,
            published_at: new Date(article.publishedAt),
            readability_score: null
          });
          
          // Add summary lengths to response
          articles.push({
            ...savedArticle,
            summaries: summaries,
            category: article.source.name === 'Reuters' ? 'Technology' : 'General'
          });
          
        } catch (dbError) {
          console.error('Error saving article:', dbError.message);
        }
      }
    }
    
    res.json({
      success: true,
      count: articles.length,
      articles: articles,
      message: `Fetched and stored ${articles.length} articles`
    });
  } catch (error) {
    console.error('NewsAPI Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news articles',
      error: error.message
    });
  }
});

// GET /api/news/stored - Get articles from database with summary options
router.get('/stored', async (req, res) => {
  try {
    const articles = await NewsModel.getAllArticles(15);
    
    // Add summary lengths to stored articles
    const articlesWithSummaries = articles.map(article => {
      const summaries = createSummaryLengths(
        article.summary, 
        article.original_content
      );
      
      return {
        ...article,
        summaries: summaries,
        category: article.source === 'Reuters' ? 'Technology' : 'General'
      };
    });
    
    res.json({
      success: true,
      count: articlesWithSummaries.length,
      articles: articlesWithSummaries,
      source: 'database'
    });
  } catch (error) {
    console.error('Database error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stored articles',
      error: error.message
    });
  }
});

module.exports = router;
