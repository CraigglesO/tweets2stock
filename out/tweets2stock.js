"use strict";
const tweets_1 = require("./tweets");
const analysis_1 = require("./analysis");
const EMOJI_THUMBS_UP = "\U0001f44d", EMOJI_THUMBS_DOWN = "\U0001f44e", EMOJI_SHRUG = "¯\_(\u30c4)_/¯";
class Tweets2Stock {
    constructor() {
        const self = this;
        self.tweets = new tweets_1.default();
        self.analyze = new analysis_1.default();
        self.tweets.on("tweet", (tweet) => {
            self.parseSentance(tweet);
        });
    }
    parseSentance(sentance) {
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Tweets2Stock;
