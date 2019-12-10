require("dotenv").config();
import Process from "./process";
const { countries = "US", limit = 10 } = require("yargs").argv;

+(async function() {
  Process.start(countries, limit);
})();
