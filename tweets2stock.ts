import Tweets from "./tweets";
import Analyze from "./analysis";

// Some emoji.
const EMOJI_THUMBS_UP = "\U0001f44d",
      EMOJI_THUMBS_DOWN = "\U0001f44e",
      EMOJI_SHRUG = "¯\_(\u30c4)_/¯";


class Tweets2Stock {
  tweets: Tweets;
  analyze: Analyze;
  constructor() {
    const self = this;
    self.tweets  = new Tweets();
    self.analyze = new Analyze();

    self.tweets.on("tweet", (tweet) => {
      self.parseSentance(tweet);
    });
  }

  parseSentance(sentance) {
    // Remove punctuation
    // Group words with capitol letters
  }
}


export default Tweets2Stock;
