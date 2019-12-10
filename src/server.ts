require("dotenv").config();

import express from "express";
import { CronJob } from "cron";
import { log } from "console";
import bodyParser from "body-parser";

import moment from "moment";
import Process from "./process";

let COUNTRIES: string = "US",
  LIMIT: number = 3,
  CRON: string = "0 */3 * * * *",
  IS_CURRENTLY_RUNNING: boolean = false,
  SERVICE_STARTED: string = "",
  PREVIOUS_RUN = {
    STARTED: "",
    ENDED: ""
  };

const app = express(),
  { PORT = 8080 } = process.env;

const JOB = function() {
  IS_CURRENTLY_RUNNING = true;
  const start = moment();
  Process.start(COUNTRIES, LIMIT).then(function() {
    IS_CURRENTLY_RUNNING = false;
    PREVIOUS_RUN.STARTED = start.toISOString();
    PREVIOUS_RUN.ENDED = moment().toISOString();
  });
};

let task = new CronJob(CRON!, JOB);

app.use(express.json());
app.use(bodyParser.json());
app.set("json spaces", 2);

app.post("/set", function(req, res) {
  if (IS_CURRENTLY_RUNNING) {
    res
      .status(400)
      .send(
        "Task is currently running. To avoid collision, please send the request later."
      );
    return;
  }

  const { cron = "0 */30 * * * *", countries = "US", limit = "10" } = req.body;

  task.stop();

  COUNTRIES = countries;
  LIMIT = limit;
  CRON = cron;

  task = new CronJob(CRON, JOB);

  task.start();
  res.status(200).send("OK");
});

app.get("/", function(req, res) {
  res.send({
    SERVICE_STARTED,
    PREVIOUS_RUN,
    CRON,
    COUNTRIES,
    LIMIT,
    IS_TASK_RUNNING: IS_CURRENTLY_RUNNING
  });
});

app.listen(PORT, function() {
  log(`listens to port ${PORT}`);
  SERVICE_STARTED = moment().toISOString();
  task.start();
});
