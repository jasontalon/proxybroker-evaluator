import moment, { Moment } from "moment";
import ProxyBroker from "./modules/proxybroker";
import Manager from "./modules/manager";
import Reporter from "./modules/reporter";

export default {
  start: async function(
    countries: string,
    limit: number,
    reporter: Reporter = new Reporter()
  ) {
    const appLogger = {
        start() {
          reporter.logMessage(
            `begin search for proxy countries ${countries}, limit ${limit}`
          );
        },
        finished(start: Moment) {
          reporter.logMessage(
            `finished. execution time -> ${moment().diff(
              start,
              "seconds"
            )} seconds`
          );
        }
      },
      start = moment();
    appLogger.start();

    const proxies = await new ProxyBroker().search(countries, limit),
      manager = new Manager();

    reporter.listen(manager.announcement);

    await manager
      .receive(proxies)
      .check()
      .then(i => i.inspect())
      .then(i => i.evaluate())
      .then(i => i.collect());

    appLogger.finished(start);
  }
};
