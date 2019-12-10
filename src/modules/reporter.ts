import { EventEmitter } from "events";
import { timestamp } from "../util";
import { white, black } from "chalk";
import { log } from "console"; 

export default class Reporter {
  listen(announcement: EventEmitter) {
    announcement
      .on("receive", (proxies: Array<string>) =>
        log(
          white("%s : received %s proxies for inspection"),
          timestamp(),
          proxies.length
        )
      )
      .on("pre-inspect", p =>
        log(
          "%s : " + black.bgMagenta("%s/%s BEGIN") + " inspect %s",
          timestamp(),
          p.current,
          p.total,
          p.proxy
        )
      )
      .on("post-inspect", info => {
        log(
          "%s : " + black.bgCyan("%s/%s END  ") + " inspect %s",
          timestamp(),
          info.current,
          info.total,
          info.proxy
        );
        log(" ");
      })
      .on("evaluate", proxies => {
        log(black.bgBlue("%s : End evaluation"), timestamp());

        proxies.forEach((p: any) => {
          if (p.passed) log(white.bgGreen("PASS ") + p.proxy);
          else log(black.bgYellow("FAIL ") + p.proxy);
        });
      })
      .on("collect", rows => {
        if (rows > 0)
          log(black.bgGreen("%s : %s rows saved."), timestamp(), rows);
        else log(black.bgYellow("%s : nothing has saved."), timestamp());
      })
      .on("error", message =>
        log(white.bgRedBright("%s : %s"), timestamp(), message)
      );
  }
}
