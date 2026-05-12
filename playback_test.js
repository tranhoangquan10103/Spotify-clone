const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  try {
    console.log('Navigating to http://localhost:5174/...');
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle', timeout: 60000 });

    console.log('Looking for the song title...');
    const songName = 'Looping the Rooms (feat. HATSUNE MIKU)';
    const songElement = await page.getByText(songName).first();
    await songElement.waitFor();
    await songElement.click();
    console.log('Clicked on song.');

    // Wait for playback to start - look for a pause button or similar indicator
    // Or just wait a few seconds
    await page.waitForTimeout(5000);

    console.log('Looking for Lyrics button/tab...');
    // Common lyrics button selectors: text 'Lyrics', or an icon
    const lyricsButton = await page.getByRole('button', { name: /lyrics/i }).or(page.getByText(/lyrics/i)).first();
    if (await lyricsButton.isVisible()) {
        await lyricsButton.click();
        console.log('Clicked Lyrics button.');
        await page.waitForTimeout(2000);
    } else {
        console.log('Lyrics button not found with default search, trying alternative...');
    }

    await page.screenshot({ path: 'lyrics_view.png', fullPage: true });
    console.log('Screenshot saved as lyrics_view.png');

  } catch (error) {
    console.error('Error during execution:', error);
  } finally {
    await browser.close();
  }
})();
