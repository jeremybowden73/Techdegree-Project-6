// import required npm modules
const moment = require('moment'); // For date and time
const fs = require('fs'); // File system
const req = require('request'); // For making http requests
const cheerio = require('cheerio'); // Cheerio takes raw HTML, parses it, and returns a jQuery object so you may traverse the DOM

// global variables
const today = moment().local().format("YYYY-MM-DD");  // get today's date in the local time zone
const singleEntryPoint = "http://shirts4mike.com/shirts.php"; // the URL that the scraper starts on
const baseURL = "http://shirts4mike.com/"; // base URL which is common to all pages we want to scrape

// check if the sub-directory 'data' exists; if not create it
fs.access('./data', fs.constants.F_OK, function (err) {
  if (err) {
    fs.mkdirSync('data');
  }
});

// go into the Single Entry Point webpage; loop over each shirt page to populate the .csv file
const request = req(singleEntryPoint, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    // check if a .csv file with today's date already exists in the sub-directory 'data'; if yes then delete it
    // because we will create a new one
    fs.access(`./data/${today}.csv`, fs.constants.F_OK, function (err) {
      err ? console.log("CSV file will be created") : fs.unlinkSync(`./data/${today}.csv`);
    });

    // use Cheerio to get the html from the body of the Single Entry Point webpage
    // $ convention per jQuery
    const $ = cheerio.load(body);
    // select all <a> elements whose href attribute starts with 'shirt.php?id=10'.
    // Each one is a link to a 'shirt page' that needs scraping
    const shirtPageLinks = $("a[href^='shirt.php?id=10']");
    // for each page, use Cheerio again to access the html of the page, and scrape the data we need from the html
    shirtPageLinks.each(function () {
      const shirtURL = baseURL + $(this).attr('href');
      const shirtPage = req(shirtURL, function (error, response, body) {
        const $ = cheerio.load(body);
        const price = $('span.price').text().trim();
        const title = $('title').text().replace(',', '-'); // replace , with - to avoid screwing-up the csv file!
        const url = shirtURL;
        const imageElement = $("img[src^='img/shirts/shirt']");
        const imgURL = baseURL + imageElement.attr('src');
        const time = moment().local().format("HH:mm");
        // add the data to the .csv file
        fs.appendFileSync(`./data/${today}.csv`, title + ',' + price + ',' + imgURL + ',' + url + ',' + time + '\n');
      });
    });
  }
});
