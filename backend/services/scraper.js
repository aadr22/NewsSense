const axios = require('axios');
const cheerio = require('cheerio');

// Common headers for all requests
const commonHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'max-age=0'
};

// Helper function to safely parse dates
const parseDate = (dateStr, source) => {
    try {
        if (!dateStr) return new Date();

        // Add source-specific date parsing if needed
        switch (source) {
            case 'economictimes':
                // Example: "Apr 11, 2024, 03:30 PM IST"
                return new Date(dateStr.replace('IST', ''));
            case 'moneycontrol':
                // Example: "April 11, 2024 / 03:30 PM"
                return new Date(dateStr);
            case 'livemint':
                // Example: "11 Apr 2024, 03:30 PM"
                return new Date(dateStr);
            default:
                return new Date(dateStr);
        }
    } catch (error) {
        console.error(`Error parsing date for ${source}:`, dateStr, error.message);
        return new Date();
    }
};

// Helper function to clean URLs
const cleanUrl = (url, baseUrl) => {
    try {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
    } catch (error) {
        console.error('Error cleaning URL:', url, error.message);
        return url;
    }
};

/**
 * Scrapes news articles from Economic Times
 * @returns {Promise<Array>} Array of scraped articles
 */
const scrapeEconomicTimes = async () => {
    try {
        console.log('Starting Economic Times scraping...');
        const response = await axios.get('https://economictimes.indiatimes.com/markets', {
            headers: commonHeaders,
            timeout: 10000
        });

        const $ = cheerio.load(response.data);
        const articles = [];

        $('.eachStory').each((i, element) => {
            try {
                const title = $(element).find('.story-title').text().trim();
                const url = cleanUrl($(element).find('a').attr('href'), 'https://economictimes.indiatimes.com');
                const date = $(element).find('.story-date').text().trim();
                const content = $(element).find('.story-summary').text().trim();

                if (title && url) {
                    articles.push({
                        title,
                        url,
                        source: 'economictimes',
                        publishedAt: parseDate(date, 'economictimes'),
                        content: content || '',
                        summary: content ? content.substring(0, 200) + '...' : ''
                    });
                }
            } catch (error) {
                console.error('Error processing Economic Times article:', error.message);
            }
        });

        console.log(`Economic Times scraping completed. Found ${articles.length} articles.`);
        return articles;
    } catch (error) {
        console.error('Error scraping Economic Times:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        }
        return [];
    }
};

/**
 * Scrapes news articles from MoneyControl
 * @returns {Promise<Array>} Array of scraped articles
 */
const scrapeMoneyControl = async () => {
    try {
        const response = await axios.get('https://www.moneycontrol.com/news/business/markets/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const $ = cheerio.load(response.data);
        const articles = [];

        $('.listingNews').each((i, element) => {
            try {
                const title = $(element).find('h2').text().trim();
                const url = $(element).find('a').attr('href');
                const date = $(element).find('.article_date').text().trim();
                const content = $(element).find('.article_desc').text().trim();

                if (title && url) {
                    articles.push({
                        title,
                        url,
                        source: 'moneycontrol',
                        publishedAt: new Date(date),
                        content: content || '',
                        summary: content ? content.substring(0, 200) + '...' : ''
                    });
                }
            } catch (error) {
                console.error('Error processing MoneyControl article:', error.message);
            }
        });

        return articles;
    } catch (error) {
        console.error('Error scraping MoneyControl:', error.message);
        return [];
    }
};

/**
 * Scrapes news articles from LiveMint
 * @returns {Promise<Array>} Array of scraped articles
 */
const scrapeLiveMint = async () => {
    try {
        const response = await axios.get('https://www.livemint.com/market', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const $ = cheerio.load(response.data);
        const articles = [];

        $('.headline').each((i, element) => {
            try {
                const title = $(element).find('h2').text().trim();
                const url = 'https://www.livemint.com' + $(element).find('a').attr('href');
                const date = $(element).find('.dateTime').text().trim();
                const content = $(element).find('.summary').text().trim();

                if (title && url) {
                    articles.push({
                        title,
                        url,
                        source: 'livemint',
                        publishedAt: new Date(date),
                        content: content || '',
                        summary: content ? content.substring(0, 200) + '...' : ''
                    });
                }
            } catch (error) {
                console.error('Error processing LiveMint article:', error.message);
            }
        });

        return articles;
    } catch (error) {
        console.error('Error scraping LiveMint:', error.message);
        return [];
    }
};

/**
 * Runs the scraper for the specified source or all sources if none specified
 * @param {string} source - The news source to scrape (optional)
 * @returns {Promise<Array>} Array of scraped articles
 */
const runScraper = async (source) => {
    try {
        console.log(`Starting scraper for source: ${source || 'all'}`);
        let articles = [];

        switch (source?.toLowerCase()) {
            case 'economictimes':
                articles = await scrapeEconomicTimes();
                break;
            case 'moneycontrol':
                articles = await scrapeMoneyControl();
                break;
            case 'livemint':
                articles = await scrapeLiveMint();
                break;
            default:
                console.log('No specific source specified, running all scrapers...');
                const [economicTimesArticles, moneyControlArticles, liveMintArticles] = await Promise.all([
                    scrapeEconomicTimes(),
                    scrapeMoneyControl(),
                    scrapeLiveMint()
                ]);

                articles = [
                    ...economicTimesArticles,
                    ...moneyControlArticles,
                    ...liveMintArticles
                ];
        }

        console.log(`Scraping completed. Total articles found: ${articles.length}`);
        return articles;
    } catch (error) {
        console.error('Error running scraper:', error.message);
        return [];
    }
};

module.exports = { runScraper }; 