const Benchmark = require('benchmark');
const fs = require('fs');

const mask = require('../index');

console.log('Sample\t\tSize\tExecutions/sec\t\tAvg exec time (ms)');

[
  './sample0.json',
  './sample1.json',
  './sample2.json',
  './sample3.json'

].forEach((file) => {
  const size = Math.ceil(fs.statSync(file).size / 1024);
  const sample = require(file);
  new Benchmark(file, () => mask(sample), {
    onComplete: function () {
      console.log(`${this.name}\t${size}kB\t${this.hz}\t${1000 / this.hz}`);
    }
  }).run();
});