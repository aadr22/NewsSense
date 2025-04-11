const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scrapes news articles from MoneyControl's latest news section.
 * @returns {Promise<Array>} - A list of scraped articles with title, URL, and timestamp.
 */
const scrapeMoneyControl = async () => {
  try {
    const url = 'https://www.moneycontrol.com/news/';
    const response = await axios.get(url);

    if (response.status !== 200) {
      throw new Error(`Failed to fetch MoneyControl: ${response.status}`);
    }

    const $ = cheerio.load(response.data);
    const articles = [];

    $('.clearfix').each((index, element) => {
      const title = $(element).find('h2').text().trim();
      const link = $(element).find('a').attr('href');
      const timestamp = $(element).find('.article_schedule').text().trim();

      if (title && link) {
        articles.push({
          title,
          url: link.startsWith('http') ? link : `https://www.moneycontrol.com${link}`,
          publishedAt: timestamp,
          source: 'MoneyControl',
        });
      }
    });

    return articles;
  } catch (error) {
    console.error('Error scraping MoneyControl:', error.message);
    return [];
  }
};

module.exports = { scrapeMoneyControl };
