import { EventEmitter } from "events";
import { timestamp } from "../util";
import { log } from "console";

export default class Reporter {
  public messages: Array<string>;

  constructor() {
    this.messages = [];
  }

  logMessage(message: string) {
    const messageWithTimestamp = `${timestamp()} : ${message}`;
    log(messageWithTimestamp);
    this.messages.push(messageWithTimestamp);
  }
  listen(announcement: EventEmitter) {
    announcement
      .on("receive", (proxies: Array<string>) =>
        this.logMessage(`received ${proxies.length} proxies for inspection`)
      )
      .on("check", (counts: any) =>
        this.logMessage(
          `${counts.total} proxies for inspection. ${counts.existing} proxies already exists in database.`
        )
      )
      .on("pre-inspect", p =>
        this.logMessage(`[${p.current}/${p.total}] BEGIN inspect ${p.proxy}`)
      )
      .on("post-inspect", p =>
        this.logMessage(`[${p.current}/${p.total}]   END inspect ${p.proxy}`)
      )
      .on("evaluate", proxies => {
        this.logMessage(`End evaluation`);

        proxies.forEach((p: any) => {
          this.logMessage(`${p.passed ? "PASS" : "FAIL"} -> ${p.proxy}`);
        });
      })
      .on("collect", rows => {
        if (rows > 0) this.logMessage(`${rows} proxy saved.`);
        else this.logMessage(`nothing has saved.`);
      })
      .on("error", message => this.logMessage(`${timestamp()} : ${message}`));
  }
}
