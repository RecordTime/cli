class TypePlugin {
  constructor(options) {
    this.options = options;
  }

  apply(cli) {
    cli.hooks.init.tap('TypePlugin', (options, core) => {
      core.hooks.BeforeSaveTask.tap('TypePlugin', task => ({
        ...task,
        type: 0,
      }));
    });
  }
}

module.exports = TypePlugin;
