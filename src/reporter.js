"use strict";

const help = require("./help");
const logger = require("testarmada-logger");
const IncomingWebhook = require("@slack/client").IncomingWebhook;
const _ = require("lodash");
const settings = require("./settings");

class Reporter {
  constructor(opts) {
    this.help = help;
    this.name = "testarmada-magellan-slack-reporter";
    this.configure(opts.argv);
  }

  configure(argv) {
    logger.prefix = "Slack Reporter";
    let valid = true;

    if (argv.slack_reporter_webhook_url) {
      settings.config.webhook = argv.slack_reporter_webhook_url;
    } else if (process.env.MAGELLAN_SLACK_WEBHOOK_URL) {
      settings.config.webhook = process.env.MAGELLAN_SLACK_WEBHOOK_URL;
    }

    const parameterWarnings = {
      apiKey: {
        required: false,
        envKey: "MAGELLAN_SLACK_API_KEY",
        cmdArg: "slack_reporter_api_key"
      },
      username: {
        required: false,
        envKey: "MAGELLAN_SLACK_USERNAME",
        cmdArg: "slack_reporter_username"
      },
      iconUrl: {
        required: false,
        envKey: "MAGELLAN_SLACK_ICON_URL",
        cmdArg: "slack_reporter_icon_url"
      },
      channel: {
        required: false,
        envKey: "MAGELLAN_SLACK_NOTIFY_CHANNEL",
        cmdArg: "slack_reporter_channel"
      },
      account: {
        required: false,
        envKey: "MAGELLAN_SLACK_ACCOUNT_NAME",
        cmdArg: "slack_reporter_account"
      },
      webhook: {
        required: true,
        envKey: "MAGELLAN_SLACK_WEBHOOK_URL",
        cmdArg: "slack_reporter_webhook_url"
      }
    };

    _.forEach(parameterWarnings, (v, k) => {
      if (!settings.config[k]) {
        if (v.required) {
          logger.err(`Error! slack reporter requires $${v.envKey} to be set.`
            + ` You can also set it via command line argument --${v.cmdArg}.`);
          valid = false;
        }
      }
    });

    if (!valid) {
      throw new Error("Missing configuration for slack reporter.");
    }

    logger.debug("Slack reporter configuration: ");
    logger.debug(JSON.stringify(settings.config));

    logger.log("Slack reporter configuration OK");

  }

  initialize() {
    logger.prefix = "Slack Reporter";
    this.slacker = new IncomingWebhook(settings.config.webhook);

    // test format
    /*
      {
        test: string
        passed: bool
        profile: string
        executor: string
      }
     */
    this.tests = [];

    return new Promise((resolve) => {
      resolve();
    });
  }

  listenTo(testRun, test, source) {
    // Every time a message is received regarding this test, we also get the test object itself so
    // that we're able to reason about retries, worker index, etc.
    source.addListener("message", this._handleMessage.bind(this, testRun, test));
  }

  /* eslint-disable no-unused-vars */
  _handleMessage(testRun, test, message) { }

  // info format
  /*
   * {
   *  totalTests: [] // total tests
   *  passedTests: [] // successful tests
   *  failedTests: [] // failed tests
   * }
   */
  flush(info) {
    logger.prefix = "Slack Reporter";

    const totalTests = info.totalTests.length;
    const totalPassed = info.passedTests.length;
    const totalFailed = info.failedTests.length;

    const totalSkipped = totalTests - totalPassed - totalFailed;

    const title = settings.jobName + (settings.buildId === null ? "" : `#${settings.buildId}`);
    const text = settings.buildUrl ? `<${settings.buildUrl}|${title}>` : title;

    const payload = {
      text: `${text}: ${totalFailed === 0 ? "PASSED" : "FAILED"}`,
      attachments: [{
        mrkdwn_in: ["text"],
        fields: []
      }]
    };

    payload.attachments[0].color = totalFailed === 0 ? "good" : "danger";
    payload.attachments[0].fields.push({
      title: "Total Tests",
      value: totalTests,
      short: false
    });

    payload.attachments[0].fields.push({
      title: "Successful",
      value: `${totalPassed}/${totalTests}\n`,
      short: false
    });

    payload.attachments[0].fields.push({
      title: "Failed",
      value: `${totalFailed}/${totalTests}\n`,
      short: false
    });

    payload.attachments[0].fields.push({
      title: "Skipped",
      value: totalSkipped,
      short: false
    });

    logger.debug(`Payload to be sent to slack: ${payload}`);

    return new Promise((resolve) => {
      /* eslint-disable max-params,no-unused-vars */
      this.slacker.send(payload, (err, header, statusCode, body) => {
        // console.log(err, statusCode)
        if (err) {
          logger.err(`Error in posting report to slack ${err}`);
        } else {
          logger.log("Test Report has been posted to slack");
        }
        resolve();
      });
    });
  }
}

module.exports = Reporter;
