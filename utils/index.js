function format(task) {
  return {
    _id: task.id,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    // 创建时间
    _timestamp: new Date(task.createdAt).valueOf(),
    _isTask: true,
    ...task.attributes,
  };
}
module.exports.format = format;
/**
 * 从 AV 中查询到的结果转换为列表
 * @param {Object} objects - 类数组对象，多条记录
 * @return {Array}
 */
module.exports.getItem = function getItem(objects) {
  return Object.keys(objects).reduce((prev, id) => {
    const task = objects[id];
    prev[id] = format(task);
    return prev;
  }, {});
};
