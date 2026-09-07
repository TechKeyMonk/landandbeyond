const { chromium } = require('@playwright/test');

const BASE_URL = 'http://localhost:8080';
const VIEWPORTS = [
  { name: '320x568 (iPhone SE 1st gen / Small Mobile)', width: 320, height: 568 },
  { name: '360x800 (Galaxy S20/Android Standard)', width: 360, height: 800 },
  { name: '375x812 (iPhone X/Mini/SE)', width: 375, height: 812 },
  { name: '390x844 (iPhone 12/13/14)', width: 390, height: 844 },
  { name: '414x896 (iPhone XR/11/Plus)', width: 414, height: 896 },
  { name: '430x932 (iPhone 14/15 Pro Max)', width: 430, height: 932 },
  { name: '768x1024 (iPad / Tablet Portrait)', width: 768, height: 1024 },
  { name: '1440x900 (Desktop Baseline)', width: 1440, height: 900 }
];

const PAGES = [
  'index.html',
  'admin-login.html',
  'book-visit.html',
  'loan-eligibility.html',
  'agro-inspection.html',
  'property-detail.html'
];

async function runAudit() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const auditReport = [];

  for (const pageName of PAGES) {
    console.log(`\n======================================================`);
    console.log(`🔍 AUDITING PAGE: ${pageName}`);
    console.log(`======================================================`);

    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height }
      });
      const page = await context.newPage();

      try {
        await page.goto(`${BASE_URL}/${pageName}`, { waitUntil: 'networkidle', timeout: 10000 });
      } catch (e) {
        try {
          await page.goto(`${BASE_URL}/${pageName}`, { waitUntil: 'domcontentloaded', timeout: 5000 });
        } catch (e2) {
          console.error(`Failed to load ${pageName} at ${vp.width}x${vp.height}: ${e2.message}`);
          await context.close();
          continue;
        }
      }

      await page.waitForTimeout(300);

      // Check overflow & find overflowing elements
      const overflowData = await page.evaluate((vpWidth) => {
        const docScrollWidth = document.documentElement.scrollWidth;
        const bodyScrollWidth = document.body.scrollWidth;
        const innerWidth = window.innerWidth;
        const isOverflowing = docScrollWidth > innerWidth || bodyScrollWidth > innerWidth;

        let culprits = [];
        if (isOverflowing) {
          const allElements = document.querySelectorAll('*');
          for (const el of allElements) {
            if (el.closest('.project-pill-tabs, .category-tabs, .ticker-content-track')) {
              continue;
            }
            const rect = el.getBoundingClientRect();
            // Check elements extending outside right edge by more than 1px
            if (rect.right > innerWidth + 1.5) {
              const tag = el.tagName.toLowerCase();
              const id = el.id ? `#${el.id}` : '';
              const cls = el.className && typeof el.className === 'string' ? `.${el.className.trim().split(/\s+/).join('.')}` : '';
              const desc = `${tag}${id}${cls}`;
              culprits.push({
                selector: desc,
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
          culprits: culprits.slice(0, 10) // top 10 culprits
        };
      }, vp.width);

      const status = overflowData.isOverflowing ? '❌ OVERFLOW' : '✅ OK';
      console.log(`[${status}] ${vp.name}: innerWidth=${overflowData.innerWidth}, scrollWidth=${overflowData.docScrollWidth}`);

      if (overflowData.isOverflowing && overflowData.culprits.length > 0) {
        console.log(`   Top overflowing elements:`);
        overflowData.culprits.slice(0, 5).forEach(c => {
          console.log(`   - ${c.selector}: width=${c.rectWidth}px, right=${c.rectRight}px (+${c.overflowAmount}px outside)`);
        });
      }

      auditReport.push({
        page: pageName,
        viewport: vp.name,
        width: vp.width,
        isOverflowing: overflowData.isOverflowing,
        docScrollWidth: overflowData.docScrollWidth,
        culprits: overflowData.culprits
      });

      await context.close();
    }
  }

  await browser.close();
  return auditReport;
}

runAudit().then(report => {
  const overflows = report.filter(r => r.isOverflowing);
  console.log(`\n======================================================`);
  console.log(`📊 AUDIT COMPLETE: ${report.length} tests run. Found ${overflows.length} viewport overflow instances.`);
  console.log(`======================================================\n`);
  process.exit(overflows.length > 0 ? 1 : 0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
