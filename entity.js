const entityFinder = require("entity-finder");
const fs           = require('fs');
const logger       = fs.createWriteStream('./nasdaqList.json', {
  flags: 'a' // 'a' means appending (old data will be preserved)
})

const lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('./nasdaqList.csv')
  // output: require('fs').createWriteStream('./nasdaqList.json')
});
logger.write("{\n");
let i = 0, success = 0, failure = 0;
lineReader.on('line', function (line) {
  if (i !== 0) {
    setTimeout(() => {
      handleLine(line);
    }, i * 1000);
  }
  if (i === 3183) {
    setTimeout(() => {
      logger.write("\n}");
    }, 10 * 1000);
  }
  i++;
});

function handleLine(line) {
  line = line.split("\",\"");
  let name = line[1];
  let obj = {
    "Symbol":    line[0].slice(1),
    "MarketCap": line[3],
    "Sector":    line[6],
    "Industry":  line[7]
  }
  obj = JSON.stringify(obj);
  entityFinder.find(name, "en").then(function(entities) {
    try {
      entities[0].names.forEach((n) => {
        logger.write( `"${n}":` + obj + ",\n");
      });
      console.log("OK");
      success++;
    } catch(e) {
      console.log("Fail");
      failure++;
    }
  });
}
