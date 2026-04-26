const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1000']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });
  await page.goto('http://localhost:8083', { waitUntil: 'networkidle0' });
  
  // Scroll to awards section
  await page.evaluate(() => {
    const heading = document.getElementById('awards-dynamic-heading');
    if (heading) {
      heading.scrollIntoView({ behavior: 'auto', block: 'center' });
    }
  });
  
  // Wait a second for any layout shifts
  await new Promise(r => setTimeout(r, 1000));
  
  await page.screenshot({ path: '/Users/timcampbell/.gemini/antigravity/brain/177a3e1c-b61c-4dbc-bc04-97fbcc570088/awards_manual_screenshot.png' });
  await browser.close();
  console.log("Screenshot saved!");
})();
