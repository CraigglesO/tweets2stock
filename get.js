const axios = require("axios");
const https = require("https");
const urlencode = require('urlencode');

function WIKIDATA_QUERY_URL(input) { return `https://query.wikidata.org/sparql?query=${input}&format=JSON` }

/** A Wikidata SPARQL query to find stock ticker symbols and other information
 *  for a company. The string parameter is the Freebase ID of the company.
 */

function MID_TO_TICKER_QUERY(input) {
  return (
    'SELECT ?companyLabel ?rootLabel ?tickerLabel ?exchangeNameLabel'
    + ' WHERE {'
    + `  ?entity wdt:P646 "${input}" .`  // Entity with specified Freebase ID.
    + '  ?entity wdt:P176* ?manufacturer .'  // Entity may be product.
    + '  ?manufacturer wdt:P156* ?company .'  // Company may have restructured.
    + '  { ?company p:P414 ?exchange } UNION'  // Company traded on exchange or...
    + '  { ?company wdt:P127+ / wdt:P156* ?root .'  // ... company has owner.
    + '    ?root p:P414 ?exchange } UNION'  // Owner traded on exchange or ...
    + '  { ?company wdt:P749+ / wdt:P156* ?root .'  // ... company has parent.
    + '    ?root p:P414 ?exchange } .'  // Parent traded on exchange.
    + '  VALUES ?exchanges { wd:Q13677 wd:Q82059 } .'  // Whitelist NYSE, NASDAQ.
    + '  ?exchange ps:P414 ?exchanges .'  // Stock exchange is whitelisted.
    + '  ?exchange pq:P249 ?ticker .'  // Get ticker symbol.
    + '  ?exchange ps:P414 ?exchangeName .'  // Get name of exchange.
    + '  FILTER NOT EXISTS { ?company wdt:P31 /'
    + '                               wdt:P279* wd:Q1616075 } .'  // Blacklist TV.
    + '  FILTER NOT EXISTS { ?company wdt:P31 /'
    + '                               wdt:P279* wd:Q11032 } .'  // Blacklist news.
    + '  SERVICE wikibase:label {'
    + '   bd:serviceParam wikibase:language "en" .'  // Use English labels.
    + '  }'
    + ' } GROUP BY ?companyLabel ?rootLabel ?tickerLabel ?exchangeNameLabel')
}

let query    = MID_TO_TICKER_QUERY("alphabet");
query = urlencode(query);
let queryUrl = WIKIDATA_QUERY_URL(query);
queryUrl = queryUrl.replace(/%20/g,"+");  // for this API
queryUrl = queryUrl.replace(/\*/g,"%2A"); // urlencode flaw

// https.get(queryUrl, (res) => {
//   const statusCode = res.statusCode;
//   const contentType = res.headers['content-type'];
//
//   let error;
//   if (statusCode !== 200) {
//     error = new Error(`Request Failed.\n` +
//                       `Status Code: ${statusCode}`);
//   }
//   if (error) {
//     console.log(error.message);
//     // consume response data to free up memory
//     res.resume();
//     return;
//   }
//
//   res.setEncoding('utf8');
//   let rawData = '';
//   res.on('data', (chunk) => rawData += chunk);
//   res.on('end', () => {
//     try {
//       let parsedData = JSON.parse(rawData);
//       console.log(parsedData);
//     } catch (e) {
//       console.log(e.message);
//     }
//   });
// }).on('error', (e) => {
//   console.log(`Got error: ${e.message}`);
// });

// axios.get(queryUrl)
//   .then(function (response) {
//     console.log(JSON.parse(response));
//   })
//   .catch(function (error) {
//     console.log(error);
//   });

// var language = require('@google-cloud/language')();
// var language = require('@google-cloud/language')({
//   projectId: 'abiding-operand-159001',
//   // The path to your key file:
//   keyFilename: './google_key.json',
//   promise: require('bluebird')
// });
//
// language.detectEntities('google, facebook, and intel')
//   .then((results) => {
//     const entities = results[0];
//
//     console.log('Entities:');
//     for (let type in entities) {
//       console.log(`${type}:`, entities[type]);
//     }
//   });

// var document = language.document('Google is Awesome!');
//
// document.detectSentiment(function(err, sentiment) {
//   console.log("sentiment:", sentiment); // sentiment = 100 // Large numbers represent more positive sentiments.
// });


// const entityFinder = require("entity-finder");
//
// entityFinder.find("Intel", "en").then(function(entities) {
// 	console.log(entities);
//   console.log("categories:", entities[0].wikiPage.categories);
// });

// alphabet -> Alphabet_Inc
// apple    -> Apple Inc
// HP       -> Hewlett-Packard
// Anthem   -> Anthem Inc
// McKesson -> McKesson Corporation
// CVS      -> CVS Health
// GM       -> General Motors
// GE       -> General Electric
// UPS      -> United Parcel Service
// CHS      -> CHS Inc

let search = ["Bayer"];

const wikipedia = require("node-wikipedia");

search.forEach((s) => {
  wikiSearch(s, (result) => {
    console.log(result);
  });
});

function wikiSearch(search, cb){
  wikipedia.page.data(search, { content: true }, function(response) {
  	// structured information on the page for Clifford Brown (wikilinks, references, categories, etc.)
    let text = JSON.stringify(response);
    let vcard_index;
    try {
      vcard_index = text.indexOf('<table class=\\"infobox vcard\\"');
    } catch (e) {
      cb(null);
      return;
    }
    if (vcard_index !== (-1)) {
      text = text.slice(vcard_index);
      // Get the info we want:
      let ticker_index_nyse     = text.indexOf("href=\\\"https://www.nyse.com/quote/");
      let ticker_index_nasd     = text.indexOf("href=\\\"http://www.nasdaq.com/symbol/");
      let ticker_index_nyse_alt = text.indexOf("title=\\\"New York Stock Exchange");
      if (ticker_index_nyse !== (-1)) {
        text = text.slice(ticker_index_nyse + 34);
        let finish = text.indexOf("\\");
        text = text.slice(0, finish);
        cb(text);
      } else if (ticker_index_nasd !== (-1)) {
        text = text.slice(ticker_index_nasd + 36);
        let finish = text.indexOf("\\");
        text = text.slice(0, finish);
        text = "NASDAQ:" + text;
        cb(text);
      } else if (ticker_index_nyse_alt !== (-1)) {
        text = text.slice(ticker_index_nyse_alt);
        let next = text.indexOf("&#160;"); // or </a>
        text = text.slice(next + 6);
        let finish = text.indexOf("</td>");
        text = text.slice(0, finish);
        text = "XNYS:" + text;
        cb(text);
      } else {
        cb(null);
      }
    } else {
      cb(null);
    }
  });
}
