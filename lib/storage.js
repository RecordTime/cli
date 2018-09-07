/**
 * @file 本地存储
 * @author ltaoo
 * @doc https://github.com/klauscfhq/taskbook/blob/master/lib/storage.js
 */
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const config = require('../common/config');
const {
  APP_DIR_NAME,
  STORAGE_DIR_NAME,
  ARCHIVE_DIR_NAME,
  TEMP_DIR_NAME,
  ARCHIVE_FILE_NAME,
  STORAGE_FILE_NAME,
} = require('../common/constants');
const render = require('./render');

class Storage {
  constructor() {
    this._storageDir = path.join(this._mainAppDir, STORAGE_DIR_NAME);
    this._archiveDir = path.join(this._mainAppDir, ARCHIVE_DIR_NAME);
    this._tempDir = path.join(this._mainAppDir, TEMP_DIR_NAME);
    this._archiveFile = path.join(this._archiveDir, ARCHIVE_FILE_NAME);
    this._mainStorageFile = path.join(this._storageDir, STORAGE_FILE_NAME);

    this._ensureDirectories();
  }

  get _mainAppDir() {
    const { directory } = config.get();
    const defaultDirectory = path.join(os.homedir(), APP_DIR_NAME);

    if (!directory) {
      return defaultDirectory;
    }

    if (!fs.existsSync(directory)) {
      render.invalidCustomeAppDir(directory);
      process.exit(1);
    }

    return path.join(directory, APP_DIR_NAME);
  }

  /**
   * 如果目录不存在，就创建
   */
  _ensureDirectories() {
    this._ensureDir(this._mainAppDir);
    this._ensureDir(this._storageDir);
    this._ensureDir(this._archiveDir);
    this._ensureDir(this._tempDir);
    this._cleanTempDir();
  }

  /**
   * @param {} dir - 要检查的目录
   */
  _ensureDir(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  }

  /**
   * 删除临时目录下的所有文件
   */
  _cleanTempDir() {
    const tempFiles = fs.readdirSync(this._tempDir).map(x => path.join(this._tempDir, x));

    if (tempFiles.length !== 0) {
      tempFiles.forEach(file => fs.unlinkSync(file));
    }
  }

  _getRandomHexString(length = 0) {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
  }

  /**
   * 计算一个临时文件的路径
   * @param {path} filePath
   * @return {path}
   */
  _getTempFilePath(filePath) {
    const randomString = this._getRandomHexString();
    const tempFilename = path.basename(filePath).split('.').join(`.TEMP-${randomString}.`);
    return path.join(this._tempDir, tempFilename);
  }

  // ============== 读写文件 ===============
  /**
   * 读取文件公共方法
   */
  readFileContent() {
    let res = {};
    if (fs.existsSync(this._archiveFile)) {
      const content = fs.readFileSync(this._archiveFile, 'utf8');
      res = JSON.parse(content);
    }

    return res;
  }

  /**
   * 读取主存储文件
   */
  get() {
    return this.readFileContent(this._mainStorageFile);
  }

  /**
   * 写入任务，先写入一个临时文件，如果不出错，就将临时文件替换为主文件
   * @param {Task} task - 任务
   */
  set(task) {
    try {
      const content = JSON.stringify(task, null, 2);
      const tempStorageFile = this._getTempFilePath(this._mainStorageFile);
      fs.writeFileSync(tempStorageFile, content, 'utf8');

      fs.renameSync(tempStorageFile, this._mainStorageFile);
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * 读取归档文件
   */
  getArchive() {
    return this.readFileContent(this._archiveFile);
  }
}

module.exports = Storage;
