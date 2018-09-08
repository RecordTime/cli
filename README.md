# RecordTime Cli

在命令行处理待办事项，使用`leancloud`存储数据。代码参考`taskbook`实现。

## Interface

### Task

为了同步，给每个`task`一个`from`字段

```js
{
  from: {
    0: 'cli',
    1: 'web',
    2: 'platform',
    3: 'mobile',
  }
}
```

## 多用户

虽然理论上来说只应该有一个用户，但是如果就是喜欢多个账号呢？

## Plugins

支持插件，比如创建任务时，向指定的地址`post`创建好的任务。

## 目录

每次执行命令，都会检查一些目录，如果不存在，就创建。

### ~/.recordtime

应用根目录，所有文件都是存放在该文件下。
通过变量`core._storage._mainAppDir`获取。

### ~/.recordtime/storage

存放了一个`storage.json`文件，内容为所有的任务。

### ~/.recordtime/archive

暂时不知道有啥用。

### ~/.recordtime/.temp

临时文件夹，每次新建任务前，都是先创建一个临时文件，再将临时文件重命名为`storage.json`。

### ~/.recordtime/archive/archive.json

### ~/.recordtime/storage/storage.json