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

const getAllMoviesInDetail = async () => {
  const list1 = await getNowShowingMovie();
  const list2 = await getUpComingMovie();

  let array = [];

  for (let index = 0; index < list1.length; index++) {
    setTimeout(async () => {
      console.log(index);
      const movie = list1[index];
      let result = await getMovie(movie.link);
      array.push(result);
      fs.writeFileSync("data.json", JSON.stringify(array));
    }, 10000 * index);
  }
  for (let index = 0; index < list2.length; index++) {
    setTimeout(async () => {
      console.log(index);
      const movie = list2[index];
      let result = await getMovie(movie.link);
      array.push(result);
      fs.writeFileSync("data.json", JSON.stringify(array));
    }, 10000 * index);
  }
};

// getProvinceAndCinemaSite();

// getAllMoviesInDetail();

// const content = JSON.parse(fs.readFileSync("data.json").toString());
// updateBasket("movies", { content });
