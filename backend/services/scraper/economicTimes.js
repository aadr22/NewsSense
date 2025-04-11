const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scrapes news articles from the Economic Times Markets section.
 * @returns {Promise<Array>} - A list of scraped articles with title, URL, and timestamp.
 */
const scrapeEconomicTimes = async () => {
  try {
    const url = 'https://economictimes.indiatimes.com/markets';
    const response = await axios.get(url);

    if (response.status !== 200) {
      throw new Error(`Failed to fetch Economic Times: ${response.status}`);
    }

    const $ = cheerio.load(response.data);
    const articles = [];

    $('.eachStory').each((index, element) => {
      const title = $(element).find('.title').text().trim();
      const link = $(element).find('a').attr('href');
      const timestamp = $(element).find('.date-time').text().trim();

      if (title && link) {
        articles.push({
          title,
          url: `https://economictimes.indiatimes.com${link}`,
          publishedAt: timestamp,
          source: 'Economic Times',
        });
      }
    });

    return articles;
  } catch (error) {
    console.error('Error scraping Economic Times:', error.message);
    return [];
  }
};

module.exports = { scrapeEconomicTimes };
