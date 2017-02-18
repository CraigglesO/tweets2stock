"use strict";
require('dotenv').config();
const Twitter = require("twitter");
const events_1 = require("events");
const client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});
class Tweets extends events_1.EventEmitter {
    constructor(opts) {
        super();
        const self = this;
        self.ready = false;
        self.USER = (opts) ? opts : { screen_name: "DewittB2012", count: 3 };
        self.latestTweet = null;
        self.update();
        setInterval(() => {
            self.update();
        }, 60 * 1000);
    }
    update() {
        const self = this;
        self.getTweets((err, tweets) => {
            if (err) {
                self.emit("error", err);
            }
            ;
            tweets.reverse();
            tweets.forEach((tweet) => {
                let time = parseInt(tweet.timestamp_ms);
                if (!self.latestTweet || self.latestTweet < time) {
                    self.latestTweet = time;
                    if (self.ready)
                        self.emit("tweet", tweet.text);
                }
            });
        });
        self.ready = true;
    }
    getTweets(cb) {
        const self = this;
        client.get("statuses/user_timeline", self.USER)
            .then(function (tweets) {
            cb(null, tweets);
        })
            .catch(function (error) {
            cb(error);
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Tweets;
