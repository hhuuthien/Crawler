// Chỉ crawl được những trang MPA dùng cơ chế Server Side Rendering (có thể thấy code khi view source)

const request = require("request-promise");
const cheerio = require("cheerio");
const fs = require("fs");

request("https://tuoitre.vn/", (error, response, html) => {
  if (!error && response.statusCode == 200) {
    const $ = cheerio.load(html);
    let data = [];
    $("ul.scroll-pane li").each((index, el) => {
      const title = $(el).find("h2").find("a").text();
      data.push(title);
    });

    fs.writeFileSync("crawler1.json", JSON.stringify(data));
  } else {
    console.log(error);
  }
});
