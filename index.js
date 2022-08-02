const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const axios = require("axios").default;
const fs = require("fs");

const key = "a0380fbf-1c1d-4218-8d97-350fbf2df51d";

const createBasket = (name) => {
  axios
    .post(`https://getpantry.cloud/apiv1/pantry/${key}/basket/${name}`)
    .then(function (response) {
      console.log("Thành công");
    })
    .catch(function (error) {
      console.log(error);
    });
};

const updateBasket = (name, content) => {
  // tạo basket mới để tránh duplicate dữ liệu
  axios.post(`https://getpantry.cloud/apiv1/pantry/${key}/basket/${name}`).then(function () {
    axios
      .put(`https://getpantry.cloud/apiv1/pantry/${key}/basket/${name}`, content)
      .then(function (response) {
        console.log("Thành công");
      })
      .catch(function (error) {
        console.log(error);
      });
  });
};

const getBasket = (name) => {
  axios
    .get(`https://getpantry.cloud/apiv1/pantry/${key}/basket/${name}`)
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
};

const deleteBasket = (name) => {
  axios
    .delete(`https://getpantry.cloud/apiv1/pantry/${key}/basket/${name}`)
    .then(function (response) {
      console.log("Thành công");
    })
    .catch(function (error) {
      console.log(error);
    });
};

const getProvinceAndCinemaSite = async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://www.cgv.vn/default/cinox/site");
    await page.waitForSelector(".cinemas-list", { timeout: 10000 });

    const body = await page.evaluate(() => {
      return document.querySelector(".content-list-cinema").innerHTML;
    });

    const $ = cheerio.load(body);

    let cinemaSite = [];
    $(".cinemas-list ul li").each((index, el) => {
      const span = $(el).find("span");
      const id = span.attr().id;
      const name = span.text();
      const url = span.attr().onclick.split("'")[1];
      const province = $(el).attr().class;
      cinemaSite.push({
        id,
        name,
        url,
        province,
      });
    });

    let province = [];
    $(".cinemas-area ul li").each((index, el) => {
      const span = $(el).find("span");
      const id = span.attr().id;
      const name = span.text();
      province.push({
        id,
        name,
      });
    });

    await browser.close();

    updateBasket("provinceAndCinemaSite", {
      province,
      cinemaSite,
    });
  } catch (error) {
    console.log(error);
  }
};

const getNowShowingMovie = async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://www.cgv.vn/default/movies/now-showing.html");
    await page.waitForSelector(".cgv-movie-info", { timeout: 10000 });

    const body = await page.evaluate(() => {
      return document.querySelector(".cgv-movies").innerHTML;
    });

    const $ = cheerio.load(body);

    let nowShowingMovie = [];
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
      nowShowingMovie.push({ title, link, rating, img, technology, info });
    });

    await browser.close();

    updateBasket("nowShowingMovie", { nowShowingMovie });
    return nowShowingMovie;
  } catch (error) {
    console.log(error);
  }
};

const getUpComingMovie = async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://www.cgv.vn/default/movies/coming-soon-1.html");
    await page.waitForSelector(".cgv-movie-info", { timeout: 10000 });

    const body = await page.evaluate(() => {
      return document.querySelector(".cgv-movies").innerHTML;
    });

    const $ = cheerio.load(body);

    let upComingMovie = [];
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
      upComingMovie.push({ title, link, rating, img, technology, info });
    });

    await browser.close();

    updateBasket("upComingMovie", { upComingMovie });
    return upComingMovie;
  } catch (error) {
    console.log(error);
  }
};

const getMovie = async (link) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(link);
    await page.waitForSelector(".movie-director", { timeout: 10000 });

    const body = await page.evaluate(() => {
      return document.querySelector(".product-view").innerHTML;
    });

    const $ = cheerio.load(body);

    const images = $(".product-essential").find("img#image-main").attr().src;
    const title = $(".product-essential").find(".product-name").find("span.h1").text().trim();
    const director = $(".product-essential").find(".movie-director").find("div.std").text().trim();
    const genre = $(".product-essential").find(".movie-genre").find("div.std").text().trim();
    const release = $(".product-essential").find(".movie-release").find("div.std").text().trim();
    const language = $(".product-essential").find(".movie-language").find("div.std").text().trim();
    const rating = $(".product-essential").find(".movie-rating").find("div.std").text().trim();

    let temp = [];
    $(".product-essential")
      .find(".movie-actress")
      .find("div.std")
      .each((i, e) => {
        temp.push($(e).text().trim());
      });

    const actor = temp[0];
    const runtime = temp[1];
    // vì actor và runtime trên website để cùng class .movie-actress

    let technology = [];
    $(".product-essential")
      .find(".movie-technology-icons")
      .find("a.movie-detail-icon-type")
      .each((i, e) => {
        technology.push($(e).find("span").text().trim());
      });

    const description = $(".product-collateral")
      .find("dl.collateral-tabs")
      .find("dd.current")
      .find("div.std")
      .text()
      .trim();

    let trailerEmbed = "";
    try {
      trailerEmbed = $(".product-collateral")
        .find("dl.collateral-tabs")
        .find("dd.last")
        .find("div.std")
        .find("iframe")
        .attr()
        .src.trim()
        .substring(2);
    } catch (error) {}

    const youtubeID = trailerEmbed.substring(22, 33);

    const data = {
      images,
      title,
      director,
      actor,
      genre,
      release,
      runtime,
      language,
      rating,
      technology,
      description,
      trailerEmbed,
      youtubeID,
    };

    await browser.close();
    return data;
  } catch (error) {
    console.log(error);
  }
};

const getSchedule = async (link) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(link);
    await page.waitForSelector(".movie-director", { timeout: 10000 });
    await page.click("button.button.btn-booking");
    await page.waitForSelector("div.tabs-cgv-movie-cites");

    const body = await page.evaluate(() => {
      return document.querySelector("div.product-collateral.toggle-content.tabs.tabs-cgv-movie-view-date > dl > dd")
        .innerHTML;
    });

    // cách làm này chỉ lấy được các suất chiếu trong ngày hiện tại

    const $ = cheerio.load(body);

    let data = [];
    $("dl#collateral-tabs.collateral-tabs")
      .children("dd.tab-container")
      .each((i, element) => {
        let format = [];
        $(element)
          .find("dl#collateral-tabs.collateral-tabs")
          .children("dd.tab-container")
          .each((i2, element2) => {
            let site = [];
            $(element2)
              .find("div.site.sitecgv")
              .each((i3, rap) => {
                const siteName = $(rap).find("h3").text().trim();
                let siteType = [];
                $(rap)
                  .find("h4")
                  .each((i, h4) => {
                    siteType.push($(h4).text().trim());
                  });
                let showTime = [];
                $(rap)
                  .find("ul")
                  .each((_, ul) => {
                    let temp = [];
                    $(ul)
                      .children("li.item")
                      .each((i4, suat) => {
                        temp.push($(suat).find("span").text().trim());
                      });
                    showTime.push(temp);
                  });
                site.push({ siteName, siteType, showTime });
              });
            format.push(site);
          });
        if (format.length !== 0) data.push(format);
      });

    let provinceLabel = [];
    $("div.product-collateral.toggle-content.tabs.tabs-cgv-movie-cites > ul")
      .children("li")
      .each((i, element) => {
        provinceLabel.push($(element).find("span").text().trim());
      });

    let formatLabel = [];
    $("dl#collateral-tabs.collateral-tabs")
      .children("dd.tab-container")
      .each((i, element) => {
        let arr = [];
        $(element)
          .find("div.product-collateral.toggle-content.tabs.tabs-cgv-movie-type > ul")
          .children("li")
          .each((i2, e) => {
            arr.push($(e).find("span").text().trim());
          });
        if (arr.length !== 0) formatLabel.push(arr);
      });

    let finalData = [];
    for (let index = 0; index < data.length; index++) {
      finalData.push({
        province: provinceLabel[index],
        availabelFormat: formatLabel[index],
        data: data[index],
      });
    }

    await browser.close();
    return { schedule: finalData };
  } catch (error) {
    console.log(error);
  }
};

const getAllMoviesInDetail_NowShowingMovie = async () => {
  const list = await getNowShowingMovie();

  let array = [];

  for (let index = 0; index < list.length; index++) {
    setTimeout(async () => {
      console.log(index);
      const movie = list[index];
      let result1 = await getMovie(movie.link);
      let result2 = await getSchedule(movie.link);
      array.push({ ...result1, ...result2 });
      fs.writeFileSync("data1.json", JSON.stringify(array));
    }, 20000 * index);
  }
};

const getAllMoviesInDetail_UpComingMovie = async () => {
  const list = await getUpComingMovie();

  let array = [];

  for (let index = 0; index < list.length; index++) {
    setTimeout(async () => {
      console.log(index);
      const movie = list[index];
      let result = await getMovie(movie.link);
      array.push(result);
      fs.writeFileSync("data2.json", JSON.stringify(array));
    }, 10000 * index);
  }
};

// 1
// getProvinceAndCinemaSite();
// 2
// getAllMoviesInDetail_NowShowingMovie();
// getAllMoviesInDetail_UpComingMovie();
// 3
// const content1 = JSON.parse(fs.readFileSync("data1.json").toString());
// const content2 = JSON.parse(fs.readFileSync("data2.json").toString());
// updateBasket("movies", { nowShowingMovie: content1, upComingMovie: content2 });
