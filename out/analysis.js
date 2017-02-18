"use strict";
const events_1 = require("events");
const parseStore = require("./conversionTable.json"), wikipedia = require("node-wikipedia"), sentiment = require("sentiment");
class Analyze extends events_1.EventEmitter {
    constructor() {
        super();
    }
    sentanceAnalysis(input) {
        let result = [];
        if (!Array.isArray(input))
            input = [input];
        input.forEach((word) => {
            result.push(this.parse(word));
        });
    }
    getSentiment(input) {
        return sentiment(input);
    }
    parse(input) {
        for (let s in parseStore) {
            if (input === s) {
                input = parseStore[s];
            }
        }
        this.wikiSearch(input);
    }
    wikiSearch(search) {
        const self = this;
        wikipedia.page.data(search, { content: true }, (response) => {
            let text = JSON.stringify(response);
            let vcard_index;
            try {
                vcard_index = text.indexOf('<table class=\\"infobox vcard\\"');
            }
            catch (e) {
                return;
            }
            if (vcard_index !== (-1)) {
                text = text.slice(vcard_index);
                vcard_index = text.indexOf('</table>');
                text = text.slice(0, vcard_index + 8);
                let ticker_index_nyse = text.indexOf("href=\\\"https://www.nyse.com/quote/");
                let ticker_index_nasd = text.indexOf("href=\\\"http://www.nasdaq.com/symbol/");
                let ticker_index_nyse_alt = text.indexOf("title=\\\"New York Stock Exchange");
                if (ticker_index_nyse !== (-1)) {
                    text = text.slice(ticker_index_nyse + 34);
                    let finish = text.indexOf("\\");
                    text = text.slice(0, finish);
                    self.emit(text);
                }
                else if (ticker_index_nasd !== (-1)) {
                    text = text.slice(ticker_index_nasd + 36);
                    let finish = text.indexOf("\\");
                    text = text.slice(0, finish);
                    text = "NASDAQ:" + text;
                    self.emit(text);
                }
                else if (ticker_index_nyse_alt !== (-1)) {
                    text = text.slice(ticker_index_nyse_alt);
                    let next = text.indexOf("&#160;");
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Analyze;
