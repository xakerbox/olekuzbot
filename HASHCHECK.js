const randomWords = require('random-words');
const fs = require('fs');


class MyHashTable {
  store = new Array(1000000);

  hashing(key) {
    let sum = 0;
    for (let char in key) {
      sum += key.charCodeAt(char);
    }
    return sum;
  }

  add(key, value) {
    this.store[this.hashing(key)] = this.store[this.hashing(key)] || [];
    this.store[this.hashing(key)].push({key, value})
  }

  get(key) {
    const res = this.store[this.hashing(key)];
    if (!res) {
      return new Error('No such key exist. Save it first.')
    }
    return res[0].value;
  }
}

const table = new MyHashTable();

for (let i = 0; i < 1000000; i++) {
  table.add(randomWords(), randomWords());
}

const cleanTable = table.store.filter(el => el != null)
fs.writeFileSync('./batchfiles.txt', JSON.stringify(cleanTable.flat(1)))




