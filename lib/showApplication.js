const { spawn } = require('child_process');

const DEFAULT_APPLICATION = '/Applications/iTerm.app';

module.exports = function open(application = DEFAULT_APPLICATION) {
  spawn('open', [application]);
};
