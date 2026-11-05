import assert from "node:assert/strict";

export async function checkMobileUI(browser, base) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const dock = page.locator('.mobile-action-bar');
  const scroll = async y => {
    await page.evaluate(y => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, y); }, y);
    await page.waitForTimeout(80);
  };
  const state = async visible => {
    await page.waitForFunction(v => document.querySelector('.mobile-action-bar')?.dataset.visible === String(v), visible);
    assert.equal(await dock.evaluate(el => el.inert), !visible);
    assert.equal(await dock.getAttribute('aria-hidden'), String(!visible));
    if (visible) await page.waitForFunction(() => {
      const style = getComputedStyle(document.querySelector('.mobile-action-bar'));
      return style.opacity === '1' && Math.abs(new DOMMatrixReadOnly(style.transform).m42) < 0.1;
    });
  };
  try {
    for (const locale of ['fr', 'en']) for (const slug of ['', '/carte']) {
      await page.goto(`${base}/${locale}${slug}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(900);
      await state(false);
      assert.equal(await dock.evaluate(el => getComputedStyle(el).opacity), '0');
      assert.equal(await dock.evaluate(el => getComputedStyle(el).pointerEvents), 'none');
      assert.equal(await dock.locator('svg.icon').count(), 3);
      assert.equal(await dock.locator('svg.icon-Phone').count(), 1);
      assert.equal(await dock.locator('svg.icon-Menu').count(), 1);
      assert.ok(!/[\u2190-\u21ff\u2261\u00d7\u29c9\uFE0F]|[\u2600-\u27BF\u{1F000}-\u{1FAFF}]/u.test(await page.locator('body').innerText()));
      await scroll(420); await page.waitForTimeout(900); await state(false);
      await scroll(1000); await state(false);
      await page.waitForTimeout(900); await state(true);
      await page.evaluate(() => window.dispatchEvent(new Event('resize')));
      await state(false); await page.waitForTimeout(900); await state(true);
      const geometry = await dock.boundingBox();
      assert.ok(geometry.width <= 340 && geometry.height === 46);
      assert.ok(Math.abs(geometry.x + geometry.width / 2 - 195) <= 1);
      assert.ok(844 - geometry.y - geometry.height >= 15);
      const axe = await import('@axe-core/playwright');
      const audit = await new axe.default({page}).include('.mobile-action-bar').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      assert.deepEqual(audit.violations, []);
      await scroll(1250); await state(false);
      await scroll(1150); await state(true);
      await page.waitForTimeout(350);
      await page.screenshot({path:`review/dock-${browser.browserType().name()}-${locale}${slug ? '-menu' : '-home'}.png`});
      // Opening the real menu must suppress the dock even after its idle timer.
      await page.locator('.menu-toggle').click();
      await state(false); await page.waitForTimeout(900); await state(false);
      await page.keyboard.press('Escape');
      await scroll(1400); await state(false);
      await page.evaluate(() => document.querySelector('.site-footer').scrollIntoView());
      await page.waitForTimeout(950); await state(false);
      await scroll(0); await page.waitForTimeout(900); await state(false);
      if (!slug) {
        for (const width of [320,390,768]) {
          await page.setViewportSize({width,height:844});
          await page.evaluate(() => document.fonts.ready);
          const geometry = await page.locator('.hero-stamp').evaluate(stamp => {
            const frame = stamp.closest('.hero-image-frame').getBoundingClientRect();
            const box = stamp.getBoundingClientRect();
            const outline = parseFloat(getComputedStyle(stamp).outlineWidth);
            return { fits: box.left-outline >= frame.left && box.right+outline <= frame.right && box.top-outline >= frame.top && box.bottom+outline <= frame.bottom,
              contentFits: stamp.scrollHeight <= stamp.clientHeight && stamp.scrollWidth <= stamp.clientWidth };
          });
          assert.ok(geometry.fits && geometry.contentFits, `${locale}: complete stamp at ${width}px`);
        }
        await page.setViewportSize({width:390,height:844});
        await page.emulateMedia({reducedMotion:'reduce'});
        await scroll(1000); await page.waitForTimeout(900); await state(true);
        assert.ok(parseFloat(await dock.evaluate(el=>getComputedStyle(el).transitionDuration)) < .001);
        await scroll(1250); await state(false);
        await page.emulateMedia({reducedMotion:'no-preference'});
      }
    }
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
}
