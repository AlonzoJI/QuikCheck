const axios = require('axios');

class NewsService {
  static async fetchTopHeadlines() {
    try {
      const response = await axios.get('https://newsapi.org/v2/top-headlines', {
        params: {
          country: 'us',
          pageSize: 15,
          apiKey: process.env.NEWS_API_KEY
        }
      });
      
      return response.data.articles.map(article => ({
        title: article.title,
        description: article.description,
        content: article.content,
        url: article.url,
        published_at: article.publishedAt,
        source: article.source.name,
        author: article.author,
        image_url: article.urlToImage
      }));
    } catch (error) {
      console.error('NewsAPI Error:', error.message);
      throw new Error('Failed to fetch news articles');
    }
  }

  static async searchNews(query) {
    try {
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: query,
          sortBy: 'publishedAt',
          pageSize: 10,
          apiKey: process.env.NEWS_API_KEY
        }
      });
      
      return response.data.articles;
    } catch (error) {
      console.error('NewsAPI Search Error:', error.message);
      throw new Error('Failed to search news');
    }
  }
}

module.exports = NewsService;
