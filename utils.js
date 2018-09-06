/**
 * 从 AV 中查询到的结果转换为列表
 * @param {Object} objects - 类数组对象，多条记录
 * @return {Array}
 */
module.exports.getItem = function getItem(objects) {
  const ary = Array.from(objects);
  return ary.map(item => {
    return {
      id: item.id,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      ...item.attributes,
    };
  });
}