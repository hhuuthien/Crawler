const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const fs = require("fs");

const getProvinceAndCinemaData = async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://www.cgv.vn/default/cinox/site");
    await page.waitForSelector(".cinemas-list", { timeout: 10000 });
    // đợi đến khi có class xuất hiện trong DOM

    const body = await page.evaluate(() => {
      return document.querySelector(".content-list-cinema").innerHTML;
    });

    const $ = cheerio.load(body);

    let cinemaData = [];
    $(".cinemas-list ul li").each((index, el) => {
      const span = $(el).find("span");
      const id = span.attr().id;
      const name = span.text();
      const url = span.attr().onclick.split("'")[1];
      const province = $(el).attr().class;
      cinemaData.push({
        id,
        name,
        url,
        province,
      });
    });

    let provinceData = [];
    $(".cinemas-area ul li").each((index, el) => {
      const span = $(el).find("span");
      const id = span.attr().id;
      const name = span.text();
      provinceData.push({
        id,
        name,
      });
    });

    fs.writeFileSync(
      "data1.json",
      JSON.stringify({
        provinceData,
        cinemaData,
      })
    );

    await browser.close();
  } catch (error) {
    console.log(error);
  }
};

const getMovieData = async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://www.cgv.vn/default/movies/now-showing.html");
    await page.waitForSelector(".cgv-movie-info", { timeout: 10000 });
    // đợi đến khi có class xuất hiện trong DOM

    const body = await page.evaluate(() => {
      return document.querySelector(".cgv-movies").innerHTML;
    });

    const $ = cheerio.load(body);

    let nowShowingMovieData = [];
    $("ul li").each((index, el) => {
      const h2 = $(el).find("h2.product-name").find("a");
      const title = h2.text().trim();
      if (title === "") return;
      const link = h2.attr().href;
      const rating = $(el).find(".nmovie-rating").text();
      const img = $(el).find("img").attr().src;
      let technology = [];
      $(el)
        .find(".movie-technology")
        .find("a")
        .find("span")
        .each((i, e) => {
          technology.push($(e).text().trim());
        });
      let info = [];
      $(el)
        .find(".cgv-info-normal")
        .each((i, e) => {
          info.push($(e).text().trim());
        });
      nowShowingMovieData.push({ title, link, rating, img, technology, info });
    });

    fs.writeFileSync("data2.json", JSON.stringify(nowShowingMovieData));

    await browser.close();
  } catch (error) {
    console.log(error);
  }
};

// getProvinceAndCinemaData();
getMovieData();
