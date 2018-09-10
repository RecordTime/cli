/**
 * @file 一些常量
 * @author ltaoo
 */
module.exports = {
  APP_DIR_NAME: process.env.NODE_ENV === 'development' ? '.record-dev' : '.recordtime',
  STORAGE_DIR_NAME: 'storage',
  ARCHIVE_DIR_NAME: 'archive',
  TEMP_DIR_NAME: '.temp',
  ARCHIVE_FILE_NAME: 'archive.json',
  STORAGE_FILE_NAME: 'storage.json',
  LOG_FILE_NAME: 'log.json',

  DEFAULT_BOARD: '@Undefined',

  NO_PERMISSION_TIP: '请先登录',
};
