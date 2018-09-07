/**
 * @doc https://github.com/klauscfhq/taskbook/blob/master/lib/item.js
 */
const now = new Date();

class Item {
  constructor(options = {}) {
    this._id = options.id;
    this._date = now.toDateString();
    this._timestamp = now.getTime();

    this.title = options.title;
    this.isStarred = options.isStarred || false;
    this.board = options.board;
  }
}

module.exports = Item;
