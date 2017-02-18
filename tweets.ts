require('dotenv').config();
import * as Twitter     from "twitter";
import { EventEmitter } from "events";

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

interface Twit {
  "screen_name": string;
  "count":       number;
}

class Tweets extends EventEmitter {
  ready:       boolean;
  USER:        Twit;
  latestTweet: number;
  constructor(opts?: Twit) {
    super();
    const self  = this;
    self.ready  = false;
    self.USER   = (opts) ? opts : {screen_name: "DewittB2012", count: 3}; // TRUMP_USER_ID = "25073877"
    self.latestTweet = null;

    self.update();
    setInterval(() => {
      self.update();
    }, 60 * 1000); // Every minute check for an update
  }

  update() {
    const self = this;
    self.getTweets((err, tweets) => {
      if (err) { self.emit("error", err); };
      // Reverse tweets (oldest first)
      tweets.reverse();
      // get and modify created_at, and text
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

export default Tweets
