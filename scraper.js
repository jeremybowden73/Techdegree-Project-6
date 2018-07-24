/*
		Treehouse techdegree project 6
    
    BUILD A WEBSITE CONTENT SCRAPER WITH NODE.JS
    
		All code contained in this JS file is the work of me, Jeremy Bowden
		email: jeremy@jeremybowden.net
*/

//
// Issue with code is that a CSV file is generated with csvFileCreator 
// on each iteratiom of the shirtPageLinks.each loop (line 68).
// It would be better if the CSV file was created only once, after the loop
// has completed, but because the loop contains an asynchronous method (req)
// moving the csvFileCreator to after the loop would result in it firing before
// the loop completes, so you won't have the required data yet!
// See here for some useful info
// https://blog.lavrton.com/javascript-loops-how-to-handle-async-await-6252dd3c795

// import required npm modules
const csvFileCreator = require('csv-file-creator'); // For creating a CSV file
const colors = require('colors'); // For colorising text logged to the console
const moment = require('moment'); // For date and time
const fs = require('fs'); // For accessing the file system
const req = require('request'); // For making http requests
const cheerio = require('cheerio'); // Cheerio takes raw HTML, parses it, and returns a jQuery object so you may traverse the DOM


// global variables
const today = moment().local().format("YYYY-MM-DD");  // get today's date in the local time zone
const timeNow = moment().local().format("h:mm:ssa");  // get the current time in the local time zone
const baseURL = "http://shirts4mike.com/"; // base URL which is common to all pages we want to scrape
const errorFile = "scraper-error.log"; // name of file where errors will be logged
let errorMessage; // variable for storing an error message
const csvFileName = `./data/${today}.csv`; // filename for the CSV file to be created
const dataForCSV = []; // empty array for storing the data for creating the CSV file
dataForCSV.push([['Title'], ['Price'], ['ImageURL'], ['URL'], ['Time']]); // add the headers

// check if the sub-directory 'data' exists; if not, create it
fs.access('./data', fs.constants.F_OK, function (err) {
  if (err) {
    fs.mkdirSync('data');
  }
});


// http request to the Single Entry Point webpage then loop over each shirt page to populate a csv file
const request = req(`${baseURL}shirts.php`, function (error, response, body) {
  if (error !== null) {
    errorMessage = `There's been an error; cannot connect to ${error.host}`;
    console.log(errorMessage.red);
  } else if (response.statusCode == 200) {
    console.log(`Good news! Connected to ${baseURL}shirts.php, the csv file is in the "data" sub-directory.`.green);

    // if any files exist in the "data" directory, remove them all
    const dataFiles = fs.readdirSync('./data/');
    if (dataFiles) {
      dataFiles.forEach(item => fs.unlinkSync(`./data/${item}`));
    }

    // use Cheerio to get the html from the body of the Single Entry Point webpage
    // $ convention per jQuery
    const $ = cheerio.load(body);
    // select all <a> elements whose href attribute starts with 'shirt.php?id=10'
    // each one is a link to a 'shirt page' that needs scraping
    const shirtPageLinks = $("a[href^='shirt.php?id=10']");
    // for each page, use Cheerio again to access the html of the page, and scrape the data we need from it
    shirtPageLinks.each(function () {
      const shirtURL = baseURL + $(this).attr('href');
      const shirtPage = req(shirtURL, function (error, response, body) {
        const $ = cheerio.load(body);
        const price = $('span.price').text().trim();
        const title = $('title').text().replace(',', ' -'); // replace , with - to avoid screwing-up the csv file
        const url = shirtURL;
        const imageElement = $("img[src^='img/shirts/shirt']");
        const imgURL = baseURL + imageElement.attr('src');
        const time = moment().local().format("HH:mm");
        // add the data to the CSV array and create a CSV file
        dataForCSV.push([[`${title}`], [`${price}`], [`${imgURL}`], [`${url}`], [`${time}`]]);
        csvFileCreator(csvFileName, dataForCSV);
      });
    });
  } else {
    errorMessage = `There's been a ${response.statusCode} error when trying to connect to ${baseURL}`;
    console.log(errorMessage.red);
  }

  // if there was an error, append the appropriate error message to the "errorFile"
  if (error !== null || response.statusCode !== 200) {
    fs.appendFileSync(`${errorFile}`, `${today} ${timeNow}: ${errorMessage}\n`);
  }
});

