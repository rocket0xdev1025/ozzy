import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const out = path.resolve("screenshots");
fs.mkdirSync(out, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu", "--hide-scrollbars"],
});

async function shot(page, name) {
  const file = path.join(out, name);
  await page.screenshot({ path: file, fullPage: false });
  console.log("saved", name);
}

const desktop = await browser.newPage();
await desktop.setViewport({ width: 1440, height: 1100, deviceScaleFactor: 1 });
await desktop.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle2", timeout: 60000 });
await desktop.waitForSelector("h1");
await new Promise((r) => setTimeout(r, 1500));
await shot(desktop, "desktop-hero.png");

const buy = await desktop.$("#copyCa");
const hrefs = await desktop.evaluate(() =>
  [...document.querySelectorAll("a")].map((a) => ({ text: a.textContent.trim().replace(/\s+/g, " "), href: a.href }))
);
console.log("LINKS", JSON.stringify(hrefs, null, 2));

await desktop.click("#copyCa");
await desktop.waitForSelector("#copied:not(.hidden)", { timeout: 3000 });
const copied = await desktop.$eval("#copied", (el) => el.textContent.trim());
console.log("COPY_RESULT", copied);
await shot(desktop, "desktop-copied.png");

await desktop.evaluate(() => document.querySelector("#about").scrollIntoView());
await new Promise((r) => setTimeout(r, 400));
await shot(desktop, "desktop-about.png");

await desktop.evaluate(() => document.querySelector("#buy").scrollIntoView());
await new Promise((r) => setTimeout(r, 400));
await shot(desktop, "desktop-howtobuy.png");

await desktop.evaluate(() => document.querySelector("#chart").scrollIntoView());
await new Promise((r) => setTimeout(r, 800));
await shot(desktop, "desktop-chart.png");

await desktop.evaluate(() => document.querySelector("footer").scrollIntoView());
await new Promise((r) => setTimeout(r, 400));
await shot(desktop, "desktop-footer.png");

const mobile = await browser.newPage();
await mobile.setViewport({ width: 390, height: 860, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await mobile.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle2", timeout: 60000 });
await mobile.waitForSelector("h1");
await new Promise((r) => setTimeout(r, 1200));
await shot(mobile, "mobile-hero.png");

await mobile.click("#menuBtn");
await new Promise((r) => setTimeout(r, 300));
const menuHidden = await mobile.$eval("#mobileMenu", (el) => el.classList.contains("hidden"));
console.log("MENU_OPEN", !menuHidden);
await shot(mobile, "mobile-menu.png");

await mobile.click('a[href="#buy"]');
await new Promise((r) => setTimeout(r, 500));
await shot(mobile, "mobile-howtobuy.png");

await mobile.evaluate(() => document.querySelector("#chart").scrollIntoView());
await new Promise((r) => setTimeout(r, 500));
await shot(mobile, "mobile-chart.png");

await mobile.evaluate(() => document.querySelector("footer").scrollIntoView());
await new Promise((r) => setTimeout(r, 400));
await shot(mobile, "mobile-footer.png");

const styles = await desktop.evaluate(() => {
  const body = getComputedStyle(document.body);
  const h1 = getComputedStyle(document.querySelector("h1 span"));
  return { bodyBg: body.backgroundColor, bodyColor: body.color, h1Color: h1.color };
});
console.log("STYLES", styles);

await browser.close();
console.log("DONE");
