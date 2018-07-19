const url = require('url');
const fs = require('fs');
const req = require('request');
const cheerio = require('cheerio'); // Cheerio takes raw HTML, parses it, and returns a jQuery object to you so you may traverse the DOM.

const singleEntryPoint = "http://shirts4mike.com/shirts.php"; // the URL that the scraper starts on
const baseURL = "http://shirts4mike.com/"; // base URL which is common to all individual shirt pages we want to scrape
const request = req(singleEntryPoint, function (error, response, body) {
  if (!error && response.statusCode == 200) {


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
      });
    });
  }
});
