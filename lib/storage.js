/**
 * @file 本地存储
 * @author ltaoo
 * @doc https://github.com/klauscfhq/taskbook/blob/master/lib/storage.js
 */
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
    this._clearTempDir();
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

  // ============== 读取文件 ===============
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
   * 读取归档文件
   */
  getArchive() {
    return this.readFileContent(this._archiveFile);
  }
}

module.exports = Storage;
