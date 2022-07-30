// Crawl được những trang SPA dùng cơ chế Client Side Rendering (không thể thấy code khi view source)

const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const fs = require("fs");

const crawl = async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://www.cgv.vn/default/cinox/site");
    await page.waitForSelector(".cinemas-list", { timeout: 10000 });
    // đợi đến khi có class xuất hiện trong DOM

    const body = await page.evaluate(() => {
      return document.querySelector(".cinemas-list").innerHTML;
    });

    const $ = cheerio.load(body);
    let data = [];
    $("ul li").each((index, el) => {
      const title = $(el).find("span").text();
      data.push(title);
    });

    fs.writeFileSync("crawler2.json", JSON.stringify(data));

    await browser.close();
  } catch (error) {
    console.log(error);
  }
};

crawl();
