# example

## show task list

```bash
/Documents/node/record-time-cli(master*) » node cli.js                                                                                                    ltaoo@ltaoodeMacBook-Pro

 @RecordTime 0/1
    1. ☐  插件从主项目分离 1d

 0% of all tasks complete.

 0 done · 1 pending
```

```bash
~/Documents/node/record-time-cli(master*) » node cli.js                                                                                                    ltaoo@ltaoodeMacBook-Pro

 @RecordTime 0/2
    1. ☐  插件从主项目分离 1d
    2. ☐  增加Jira插件

 0% of all tasks complete.

 0 done · 2 pending
```

## add task

```bash
 ~/Documents/node/record-time-cli(master*) » node cli.js -t 增加Jira插件 @RecordTime                                                                        ltaoo@ltaoodeMacBook-Pro

 ✔  Created task 2
```

## start work

```bash
~/Documents/node/record-time-cli(master*) » node cli.js --doing                                                                                            ltaoo@ltaoodeMacBook-Pro

 😩  Start Work! 00:27:45
00:02
```

## log time

```bash
~/Documents/node/record-time-cli(master*) » node cli.js --doing                                                                                            ltaoo@ltaoodeMacBook-Pro


 🍅  Get! 00:27:45 ~ 00:27:50

 @RecordTime 0/2
    1. ☐  插件从主项目分离 1d
    2. ☐  增加Jira插件
? Task
```

## auto rest

```bash
~/Documents/node/record-time-cli(master*) » node cli.js --doing                                                                                            ltaoo@ltaoodeMacBook-Pro


 🍅  Get! 00:27:45 ~ 00:27:50

 @RecordTime 0/2
    1. ☐  插件从主项目分离 1d
    2. ☐  增加Jira插件
? Task 1
? Content 完成分离，思考插件模式
 ☕️  Resting Time!
00:02
```

## doing

```bash
 🍅  Get! 00:27:45 ~ 00:27:50

 @RecordTime 0/2
    1. ☐  插件从主项目分离 1d
    2. ☐  增加Jira插件
? Task 1
? Content 完成分离，思考插件模式



 🍅  Get! 00:29:31 ~ 00:29:36

 @RecordTime 0/2
    1. ☐  插件从主项目分离 1d
    2. ☐  增加Jira插件
? Task
? Content



 🍅  Get! 00:30:06 ~ 00:30:11

 @RecordTime 0/2
    1. ☐  插件从主项目分离 1d
    2. ☐  增加Jira插件
? Task 1
? Content
```

## complete task

```bash
~/Documents/node/record-time-cli(master*) » node cli.js -c 1    ltaoo@ltaoodeMacBook-Pro

 ✔  Checked task 1
```

```bash

 🍅  Get! 00:33:02 ~ 00:33:07

 @RecordTime 1/2
    2. ☐  增加Jira插件
? Task 1
? Content
```