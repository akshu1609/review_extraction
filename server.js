require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { chromium } = require('playwright');
const OPENAI_CONFIG = require('./config'); // Import the OpenAI configuration

const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Function to call OpenAI API for LLM
async function getLLMSelectors(htmlContent) {
    const response = await axios.post(OPENAI_CONFIG.API_BASE, {
        model: OPENAI_CONFIG.CHAT_MODEL,
        messages: [{
            role: "user",
            content: `Given the following HTML content, suggest CSS selectors to extract review data:\n\n${htmlContent}`
        }],
        max_tokens: 150
    }, {
        headers: {
            'Authorization': `Bearer ${OPENAI_CONFIG.API_KEY}`,
            'Content-Type': 'application/json'
        }
    });

    return response.data.choices[0].message.content; // Extract suggested selectors from LLM response
}

// Function to extract reviews from a given URL
async function extractReviews(url) {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
        console.log('Page loaded successfully.');

        const htmlContent = await page.content();
        const suggestedSelectors = await getLLMSelectors(htmlContent);
        console.log('Suggested Selectors:', suggestedSelectors);

        // Assuming the LLM returns selectors like ".review-container"
        const selectors = suggestedSelectors.split(',').map(s => s.trim());

        let reviews = [];

        // Function to fetch reviews using dynamic selectors
        async function fetchReviews() {
            for (const selector of selectors) {
                const reviewElements = await page.$$(selector);
                for (const element of reviewElements) {
                    const reviewText = await element.innerText();
                    reviews.push(reviewText);
                }
            }
        }

        await fetchReviews();

        // Handle pagination (if necessary)
        while (true) {
            const nextButton = await page.$('a.next'); // Update with your pagination button selector
            if (nextButton) {
                await nextButton.click();
                await page.waitForTimeout(2000); // Wait for new content to load
                await fetchReviews(); // Fetch reviews from the new page
            } else {
                break; // Exit loop if no more pages
            }
        }

        return reviews.slice(0, 4); // Return only the top 4 reviews
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return [];
    } finally {
        await browser.close();
    }
}

// API Endpoint to get reviews using a GET request
app.get('/api/reviews', async (req, res) => {
    const { url } = req.query; // Use query parameters to get the URL

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const reviews = await extractReviews(url);
        res.json({ reviews });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Error fetching reviews' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
