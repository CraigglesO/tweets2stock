import { EventEmitter } from "events";

const parseStore = require("./conversionTable.json"),
      wikipedia = require("node-wikipedia"),
      sentiment = require("sentiment");

class Analyze extends EventEmitter {
  constructor() {
    super();
  }

  sentanceAnalysis(input: Array<string> | string) {
    let result = [];
    if (!Array.isArray(input))
      input = [input];
    input.forEach((word) => {
      result.push(this.parse(word));
    });
  }

  getSentiment(input: string) {
    return sentiment(input);
  }

  parse(input: string) {
    // Convert if there is a match
    for (let s in parseStore) {
      if (input === s) {
        // Convert
        input = parseStore[s];
      }
    }
    // Now search:
    this.wikiSearch(input);
  }

  wikiSearch(search: string){
    const self = this;
    wikipedia.page.data(search, { content: true }, (response) => {
    	// structured information on the page for Clifford Brown (wikilinks, references, categories, etc.)
      let text = JSON.stringify(response);
      let vcard_index;
      try {
        vcard_index = text.indexOf('<table class=\\"infobox vcard\\"');
      } catch (e) {
        return;
      }
      if (vcard_index !== (-1)) {
        text = text.slice(vcard_index);
        vcard_index = text.indexOf('</table>');
        text = text.slice(0, vcard_index + 8);
        let ticker_index_nyse     = text.indexOf("href=\\\"https://www.nyse.com/quote/");
        let ticker_index_nasd     = text.indexOf("href=\\\"http://www.nasdaq.com/symbol/");
        let ticker_index_nyse_alt = text.indexOf("title=\\\"New York Stock Exchange");
        if (ticker_index_nyse !== (-1)) {
          text = text.slice(ticker_index_nyse + 34);
          let finish = text.indexOf("\\");
          text = text.slice(0, finish);
          self.emit(text);
        } else if (ticker_index_nasd !== (-1)) {
          text = text.slice(ticker_index_nasd + 36);
          let finish = text.indexOf("\\");
          text = text.slice(0, finish);
          text = "NASDAQ:" + text;
          self.emit(text);
        } else if (ticker_index_nyse_alt !== (-1)) {
          text = text.slice(ticker_index_nyse_alt);
          let next = text.indexOf("&#160;"); // or </a>
          text = text.slice(next + 6);
          let finish = text.indexOf("</td>");
          text = text.slice(0, finish);
          text = "XNYS:" + text;
          self.emit(text);
        }
      }
    });
  }
}

export default Analyze;
