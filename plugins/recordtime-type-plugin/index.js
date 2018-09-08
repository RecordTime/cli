class TypePlugin {
  constructor(core) {
    this.core = core;
  }

  apply(core) {
    core.hooks.BeforeSaveTask.tap('TypePlugin', task => ({
      ...task,
      type: 0,
    }));
  }
}

module.exports = TypePlugin;
