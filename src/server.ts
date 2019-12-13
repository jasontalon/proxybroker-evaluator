require("dotenv").config();

import express from "express";
import { CronJob } from "cron";
import { log } from "console";
import bodyParser from "body-parser";

import moment from "moment";
import Process from "./process";
import Reporter from "./modules/reporter";

let CRON: string = "0 */40 17-23 * * 1-5",
  TASK: {
    STATUS: string;
    PARAMS: {
      COUNTRIES: string;
      LIMIT: number;
    };
    REPORTER: {
      MESSAGES: Array<string>;
    };
  } = {
    STATUS: "IDLE",
    PARAMS: {
      COUNTRIES: "US,CA,GB",
      LIMIT: 35
    },
    REPORTER: {
      MESSAGES: []
    }
  },
  SERVICE: {
    STARTED_AT_UTC: string;
    STATUS: string;
  },
  PREVIOUS_TASK: {
    STARTED_AT_UTC: string;
    FINISHED_AT_UTC: string;
    ERROR: string | null;
    REPORTER: {
      MESSAGES: Array<string>;
    };
  },
  REPORTER: Reporter | null;

const app = express(),
  { PORT = 8080 } = process.env;

const JOB = async function() {
  const start = moment();
  let error: string | null;
  try {
    TASK.STATUS = "RUNNING";

    const { COUNTRIES, LIMIT } = TASK.PARAMS;
    REPORTER = new Reporter();
    await Process.start(COUNTRIES, LIMIT, REPORTER);
  } catch (err) {
    error = JSON.stringify(err);
  } finally {
    TASK.STATUS = "IDLE";
    PREVIOUS_TASK = {
      STARTED_AT_UTC: start.toISOString(),
      FINISHED_AT_UTC: moment().toISOString(),
      ERROR: error!,
      REPORTER: {
        MESSAGES: REPORTER!.messages
      }
    };
    REPORTER = null;
  }
};

let task = new CronJob(CRON!, JOB);

app.use(express.json());
app.use(bodyParser.json());
app.set("json spaces", 2);

app.post("/start", function(req, res) {
  if (task.running) sendMessage(res, "already started.", 403);
  else if (!sendResponseIfTaskIsRunning(TASK.STATUS, res)) {
    task.start();
    REPORTER = null;
    SERVICE.STATUS = "STARTED";
    TASK.STATUS = "IDLE";
    SERVICE.STARTED_AT_UTC = moment().toISOString();

    PREVIOUS_TASK = {
      ERROR: null,
      STARTED_AT_UTC: "",
      FINISHED_AT_UTC: "",
      REPORTER: {
        MESSAGES: []
      }
    };
    sendMessage(res, "OK");
  }
});

app.post("/stop", function(req, res) {
  if (!task.running) sendMessage(res, "already stopped.", 403);
  else if (!sendResponseIfTaskIsRunning(TASK.STATUS, res)) {
    task.stop();
    REPORTER = null;
    TASK.STATUS = SERVICE.STATUS = "STOPPED";
    sendMessage(res, "OK");
  }
});

app.post("/set", function(req, res) {
  const { cron = "0 */30 * * * *", countries = "US", limit = "10" } = req.body;

  if (!sendResponseIfTaskIsRunning(TASK.STATUS, res)) {
    TASK.STATUS = SERVICE.STATUS = "STOPPED";
    task.stop();

    TASK.PARAMS = {
      COUNTRIES: countries,
      LIMIT: limit
    };

    CRON = cron;

    task = new CronJob(CRON, JOB);
    REPORTER = null;
    task.start();
    TASK.STATUS = "IDLE";
    SERVICE = {
      STATUS: "STARTED",
      STARTED_AT_UTC: moment().toISOString()
    };
    sendMessage(res, "OK");
  }
});

app.get("/status", function(req, res) {
  TASK.REPORTER = {
    MESSAGES: REPORTER ? REPORTER.messages : []
  };

  if (SERVICE.STATUS == "STOPPED") TASK.STATUS = "STOPPED";
  res.send({
    CRON,
    SERVICE,
    TASK,
    PREVIOUS_TASK
  });
});

function sendMessage(res: any, message: string, status: number = 200) {
  res.status(status).send({ message });
}

function sendResponseIfTaskIsRunning(status: string, response: any) {
  if (status == "RUNNING") {
    sendMessage(response, "Task is currently running.", 403);
    return true;
  }
  return false;
}

app.listen(PORT, function() {
  log(`listens to port ${PORT}`);
  task.start();
  SERVICE = {
    STATUS: "STARTED",
    STARTED_AT_UTC: moment().toISOString()
  };
});
