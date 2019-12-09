require("dotenv").config();
import Manager from "./manager";
import ProxyBroker from "./modules/proxybroker";
import Reporter from "./reporter";
import moment, { Moment } from "moment";
import { log } from "console";

const { countries = "US", limit = 10 } = require("yargs").argv;
const appLogger = {
  start(start: Moment) {
    log(
      "%s : begin search for proxy countries %s, limit %s",
      start.toISOString(),
      countries,
      limit
    );
  },
  finished(start: Moment) {
    console.log(
      "%s : finished. execution time: %ss",
      moment().toISOString(),
      moment().diff(start, "seconds")
    );
  }
};
+(async function() {
  const start = moment();
  appLogger.start(start);
  const proxies = await new ProxyBroker().search(countries, limit);
  const manager = new Manager();

  new Reporter().listen(manager.announcement);

  await manager
    .receive(proxies)
    .inspect()
    .then(i => i.evaluate())
    .then(i => i.collect());

  appLogger.finished(start); 
})();
