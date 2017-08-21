module.exports = {
  "slack_reporter_account": {
    "visible": false,
    "type": "string",
    "example": "slackuser",
    "description": "Slack user account to be used to post report."
  },

  "slack_reporter_api_key": {
    "visible": false,
    "type": "string",
    "example": "xx992312ss",
    "description": "Slack user api key to be used to post report."
  },

  "slack_reporter_username": {
    "visible": false,
    "type": "string",
    "example": "magellanslackreporter",
    "description": "Slack user name to be displayed for the report."
  },

  "slack_reporter_channel": {
    "visible": false,
    "type": "string",
    "example": "magellan-ci",
    "description": "Slack channel to post report in."
  },

  "slack_reporter_webhook_url": {
    "visible": true,
    "type": "string",
    "example": "https://hooks.slack.com/services/xxxxxxxxx",
    "description": "Slack webhook url for your channel to post report in."
  }
};
