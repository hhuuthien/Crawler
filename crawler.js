const request = require("request-promise");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const fs = require("fs");

const crawler1 = () => {
  // Chỉ crawl được những trang MPA dùng cơ chế Server Side Rendering (có thể thấy code khi view source)
  request("https://tuoitre.vn/", (error, response, html) => {
    if (!error && response.statusCode == 200) {
      const $ = cheerio.load(html);
      let data = [];
      $("ul.scroll-pane li").each((index, el) => {
        const title = $(el).find("h2").find("a").text();
        data.push(title);
      });

      fs.writeFileSync("data.json", JSON.stringify(data));
    } else {
      console.log(error);
    }
  });
};

const crawler2 = async () => {
  // Crawl được những trang SPA dùng cơ chế Client Side Rendering (không thể thấy code khi view source)
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

    fs.writeFileSync("data.json", JSON.stringify(data));

    await browser.close();
  } catch (error) {
    console.log(error);
  }
};

// crawler1();
crawler2();
