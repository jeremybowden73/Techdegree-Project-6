/*
		Treehouse techdegree project 6
    
    BUILD A WEBSITE CONTENT SCRAPER WITH NODE.JS
    
		All code contained in this JS file is the work of me, Jeremy Bowden
		email: jeremy@jeremybowden.net
*/

// ********************** THE ASYNC PROBLEM STUFF STARTS AT LINE  55 *******************************************************

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
let shirtPageLinks;

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
    console.log("This is in the req function");
    // csvFileCreator(csvFileName, dataForCSV);
  });
};




// 
// async function, allowing the use of "await" which forces the program to wait for the Promise
// to be returned from the function "resolveforXSeconds" before logging the next two lines fo code.
// without the "await" the code would run asynchronously, so those two lines of code would be
// executed BEFORE the function "resolveforXSeconds" returns its Promise
async function f1() {
  var promiseResolve = await resolveAfter2Seconds(shirtPageLinks);
  console.log(promiseResolve);
  console.log("This should be the last thing to log!");
  // create the csv file
  // csvFileCreator(csvFileName, dataForCSV);
}


// function to simulate an async method that takes 3 seconds to complete.
// after it completes the Promise returns 'resolve' i.e. "3 seconds up"
function resolveAfter3Seconds(x) {
  return new Promise(function (resolve, reject) {
    setTimeout(() => {
      resolve("3 seconds up");
      reject("failed");
    }, 3000);
  });
}

// function to perform a http request using the async method "req" (i.e. module "request")
// the Promise returns the string in "resolve" after it completes the request
// which is fine when there is only one request being made, but I wanted to loop over 8 pages using a .each loop.
// This brings the problem:
// If the resolve is inside the .each loop it will resolve after the first iteration of the loop, not the last as I want.
// But if the resolve is AFTER the loop, the Promise will return the resolve immediately, i.e. BEFORE the async requests
// in the .each loop are completed.
function resolveAfter2Seconds() {
  return new Promise(function (resolve, reject) {

    req('http://shirts4mike.com/shirt.php?id=101', function (error, response, body) {
      const $ = cheerio.load(body);
      const price = $('span.price').text().trim();
      const time = moment().local().format("HH:mm");
      console.log(price); // This should be the first thing to log to the console

      // add the data to the CSV array and create a CSV file
      // dataForCSV.push([[`${price}`], [`${time}`]]);
      resolve("This is in the 2SECONDS function");
    });


    // CANNOT put the resolve here, after the asynchronous "req" function because it will return before the "req" function is done
    // resolve("This is in the 2SECONDS function");


  });
};


f1();





