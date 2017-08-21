

const config = {
  apiKey: null,
  username: null,
  iconUrl: null,
  channel: null,
  account: null,
  webhook: null
};

module.exports = {
  config,
  buildUrl: process.env.BUILD_URL || null,
  buildId: process.env.BUILD_ID || null,
  jobName: process.env.MAGELLAN_JOB_NAME || "Local Test Suite"
};
