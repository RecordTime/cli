# lean 插件，支持数据同步

## 同步机制（待实现）

在每次操作（新增、删除、编辑）任务时，都是一次，不支持批量。

OK，所以每次操作都会生成一条操作记录，也就是`commit`，记录了这次操作的详细，如：

```js
{
  'hash1': {
    id: 1,
    type: 'create',
    parent: null,
  },
  'hash2': {
    id: 1,
    type: 'update',
    meta: {
      state: 1,
    },
    parent: 'hash1',
  },
  'hash3': {
    id: 1,
    type: 'delete',
    parent: 'hash2',
  },
}
```