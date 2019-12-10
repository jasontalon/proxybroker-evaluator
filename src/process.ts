import moment, { Moment } from "moment";
import { log } from "console";
import ProxyBroker from "./modules/proxybroker";
import Manager from "./modules/manager";
import Reporter from "./modules/reporter";

export default {
  start: async function(countries: string, limit: number) {
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
      },
      start = moment();
    appLogger.start(start);

    const proxies = await new ProxyBroker().search(countries, limit),
      manager = new Manager();

    new Reporter().listen(manager.announcement);

    await manager
      .receive(proxies)
      .check()
      .then(i => i.inspect())
      .then(i => i.evaluate())
      .then(i => i.collect());

    appLogger.finished(start);
  }
};
