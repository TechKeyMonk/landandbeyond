const { chromium } = require('@playwright/test');

const BASE_URL = 'http://localhost:8080';
const VIEWPORTS = [
  { name: '320x568 (Small Mobile)', width: 320, height: 568 },
  { name: '360x800 (Galaxy S20)', width: 360, height: 800 },
  { name: '375x812 (iPhone X/Mini)', width: 375, height: 812 },
  { name: '390x844 (iPhone 12/13/14)', width: 390, height: 844 },
  { name: '414x896 (iPhone Plus)', width: 414, height: 896 },
  { name: '768x1024 (Tablet Portrait)', width: 768, height: 1024 },
  { name: '1440x900 (Desktop)', width: 1440, height: 900 }
];

async function testDashboard() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  console.log('======================================================');
  console.log('🔍 AUDITING DASHBOARD.HTML (AUTHENTICATED ADMIN)');
  console.log('======================================================\n');

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height }
    });
    const page = await context.newPage();

    // Set auth tokens in sessionStorage & localStorage before load
    await page.addInitScript(() => {
      sessionStorage.setItem('isAdminAuthenticated', 'true');
      sessionStorage.setItem('isAdminAuth', 'true');
      sessionStorage.setItem('isAdminLoggedIn', 'true');
      localStorage.setItem('isAdminAuthenticated', 'true');
    });

    await page.goto(`${BASE_URL}/dashboard.html`, { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(500);

    const overflowData = await page.evaluate(() => {
      const docScrollWidth = document.documentElement.scrollWidth;
      const bodyScrollWidth = document.body.scrollWidth;
      const innerWidth = window.innerWidth;
      const isOverflowing = docScrollWidth > innerWidth || bodyScrollWidth > innerWidth;

      let culprits = [];
      if (isOverflowing) {
        const allElements = document.querySelectorAll('*');
        for (const el of allElements) {
          const rect = el.getBoundingClientRect();
          if (rect.right > innerWidth + 1.5) {
            const tag = el.tagName.toLowerCase();
            const id = el.id ? `#${el.id}` : '';
            const cls = el.className && typeof el.className === 'string' ? `.${el.className.trim().split(/\s+/).join('.')}` : '';
            culprits.push({
              selector: `${tag}${id}${cls}`,
              rectRight: Math.round(rect.right),
              rectWidth: Math.round(rect.width),
              overflowAmount: Math.round(rect.right - innerWidth)
            });
          }
        }
      }

      return {
        innerWidth,
        docScrollWidth,
        bodyScrollWidth,
        isOverflowing,
        culprits: culprits.slice(0, 10)
      };
    });

    const status = overflowData.isOverflowing ? '❌ OVERFLOW' : '✅ OK';
    console.log(`[${status}] ${vp.name}: innerWidth=${overflowData.innerWidth}, scrollWidth=${overflowData.docScrollWidth}`);

    if (overflowData.isOverflowing && overflowData.culprits.length > 0) {
      console.log(`   Top overflowing elements on dashboard:`);
      overflowData.culprits.slice(0, 5).forEach(c => {
        console.log(`   - ${c.selector}: width=${c.rectWidth}px, right=${c.rectRight}px (+${c.overflowAmount}px outside)`);
      });
    }

    await context.close();
  }

  await browser.close();
}

testDashboard().catch(console.error);
