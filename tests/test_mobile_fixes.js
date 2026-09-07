const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const css = `
    @media (max-width: 640px) {
      .container {
        width: calc(100% - 24px) !important;
        max-width: calc(100% - 24px) !important;
      }
      .hero-container, .hero-content, .matcher-panel {
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        box-sizing: border-box !important;
      }
      .hero-title {
        font-size: clamp(1.6rem, 7vw, 2.2rem) !important;
        word-break: break-word !important;
      }
      .hero-description {
        font-size: 0.92rem !important;
        line-height: 1.5 !important;
        margin-bottom: 20px !important;
      }
      .hero-stats-grid {
        grid-template-columns: 1fr 1fr !important;
        gap: 8px !important;
        padding: 12px !important;
      }
      .stat-box {
        padding: 6px !important;
      }
      .stat-number {
        font-size: 1.15rem !important;
      }
      .stat-label {
        font-size: 0.7rem !important;
      }
      .hero-top-badges-row {
        gap: 8px !important;
        margin-bottom: 16px !important;
      }
      .hero-pill-badge, .hero-category-ticker {
        font-size: 0.72rem !important;
        padding: 5px 10px !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
      }
    }
    .services-dual-layout, .services-column, .calculator-column, .service-feature-card, .calc-card {
      width: 100% !important;
      max-width: 100% !important;
      min-width: 0 !important;
      box-sizing: border-box !important;
    }
    .service-feature-card, .calc-card {
      padding: clamp(16px, 4vw, 24px) !important;
    }
    .testimonials-slider-wrapper {
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      gap: 8px !important;
    }
    .testimonials-slider-wrapper .slider-btn {
      width: 36px !important;
      height: 36px !important;
      min-width: 36px !important;
      min-height: 36px !important;
      flex-shrink: 0 !important;
    }
    .testimonials-track {
      flex: 1 !important;
      min-width: 0 !important;
    }
    .review-card {
      padding: 16px 14px !important;
      box-sizing: border-box !important;
    }
    @media (max-width: 640px) {
      .news-ticker-container {
        flex-direction: column !important;
        border-radius: 14px !important;
        padding: 8px 10px !important;
        gap: 8px !important;
        min-height: auto !important;
        align-items: flex-start !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }
      .ticker-badge-wrapper {
        position: static !important;
        padding: 0 !important;
        background: transparent !important;
      }
      .ticker-header-badge {
        padding: 4px 12px !important;
        font-size: 0.68rem !important;
      }
      .ticker-track-wrap {
        margin-left: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
        overflow: hidden !important;
      }
    }
  `;

  for (const w of [320, 360, 375, 390, 414, 430, 768]) {
    const page = await browser.newPage({ viewport: { width: w, height: 800 } });
    await page.goto('http://localhost:8080/index.html', { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: css });
    const info = await page.evaluate(() => ({
      docScroll: document.documentElement.scrollWidth,
      bodyScroll: document.body.scrollWidth,
      inner: window.innerWidth
    }));
    console.log(`Width ${w}: inner=${info.inner}, docScroll=${info.docScroll}, bodyScroll=${info.bodyScroll}`);
    await page.close();
  }
  await browser.close();
})();
