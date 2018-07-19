const moment = require('moment');
const url = require('url');
const fs = require('fs');
const req = require('request');
const cheerio = require('cheerio'); // Cheerio takes raw HTML, parses it, and returns a jQuery object to you so you may traverse the DOM.

let today = moment().local().format("YYYY-MM-DD");  // get today's date in the local time zone

// check if the sub-directory 'data' exists; if not create it
fs.access('./data', fs.constants.F_OK, function (err) {
  if (err) {
    fs.mkdirSync('data');
  }
});


const singleEntryPoint = "http://shirts4mike.com/shirts.php"; // the URL that the scraper starts on
const baseURL = "http://shirts4mike.com/"; // base URL which is common to all individual shirt pages we want to scrape
const request = req(singleEntryPoint, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    // check if the .csv file exists in the sub-directory 'data'; if yes then delete it
    fs.access(`./data/${today}.csv`, fs.constants.F_OK, function (err) {
      err ? console.log("CSV file will be created") : fs.unlinkSync(`./data/${today}.csv`);
    });

    const $ = cheerio.load(body); // var $ is the html body of the webpage. ($ convention per jQuery.)
    // select all <a> elements whose href attribute starts with 'shirt.php?id=10' then put them all into the allShirtPages array
    const allShirtPages = [];
    const shirtPageLinks = $("a[href^='shirt.php?id=101']");
    shirtPageLinks.each(function () {
      allShirtPages.push(baseURL + $(this).attr('href'));
    });

    // loop over each shirt webpage
    allShirtPages.forEach(function (item) {
      const shirtPage = req(item, function (error, response, html) {
        const $ = cheerio.load(html);
        const price = $('span.price').text().trim();
        const title = $('title').text();
        const url = item;
        const imageElement = $("img[src^='img/shirts/shirt']");
        const imgURL = baseURL + imageElement.attr('src');
        console.log(price);
        console.log(title);
        console.log(url);
        console.log(imgURL);
        fs.appendFileSync(`./data/${today}.csv`, price + ',' + title + ',' + url + ',' + imgURL + ',');
      });
    });
  }
});
