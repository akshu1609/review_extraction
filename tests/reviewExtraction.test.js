const fetchService = require('../services/fetchService');

describe('Fetch Service', () => {
  it('should fetch HTML from a given URL', async () => {
    const html = await fetchService.fetchHTML('https://example.com/product-page');
    expect(html).toBeDefined();
  });
});
