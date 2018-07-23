/*
		Treehouse techdegree project 6
    
    BUILD A WEBSITE CONTENT SCRAPER WITH NODE.JS
    
		All code contained in this JS file is the work of me, Jeremy Bowden
		email: jeremy@jeremybowden.net
*/


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



function populateCSVDataArray() {
  // for each page, use Cheerio again to access the html of the page, and scrape the data we need from it
  const shirtPage = req('http://shirts4mike.com/shirt.php?id=101', function (error, response, body) {
    const $ = cheerio.load(body);
    const price = $('span.price').text().trim();
    const time = moment().local().format("HH:mm");
    // add the data to the CSV array and create a CSV file
    dataForCSV.push([[`${price}`], [`${time}`]]);
    // console.log(dataForCSV);
    csvFileCreator(csvFileName, dataForCSV);
  });
};

populateCSVDataArray();

async function populate() {
  await anotherOne();
  csvFileCreator(csvFileName, dataForCSV);
}



