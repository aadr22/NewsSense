const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scrapes news articles from LiveMint's latest news section.
 * @returns {Promise<Array>} - A list of scraped articles with title, URL, and timestamp.
 */
const scrapeLiveMint = async () => {
  try {
    const url = 'https://www.livemint.com/latest-news';
    const response = await axios.get(url);

    if (response.status !== 200) {
      throw new Error(`Failed to fetch LiveMint: ${response.status}`);
    }

    const $ = cheerio.load(response.data);
    const articles = [];

    $('.headline').each((index, element) => {
      const title = $(element).text().trim();
      const link = $(element).find('a').attr('href');
      const timestamp = $(element).find('.time').text().trim();

      if (title && link) {
        articles.push({
          title,
          url: link.startsWith('http') ? link : `https://www.livemint.com${link}`,
          publishedAt: timestamp,
          source: 'LiveMint',
        });
      }
    });

    return articles;
  } catch (error) {
    console.error('Error scraping LiveMint:', error.message);
    return [];
  }
};

module.exports = { scrapeLiveMint };
