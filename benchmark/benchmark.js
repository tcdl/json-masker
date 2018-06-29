const Benchmark = require('benchmark');
const fs = require('fs');

const masker = require('../masker');

console.log('Sample\t\tSize\tExecutions/sec\t\tAvg exec time (ms)');

[
  ['./sample0.json', ['html_url', 'received_events_url', '$..diff_url', '$[0].url']],
  ['./sample1.json', ['state', 'maintainer_can_modify', '$..href', '$.title']],
  ['./sample2.json', ['sha', '$..name', '$[0].commit.url']],
  ['./sample3.json', ['customer.additional.inputDeliveryPointSuffix', '$..urn']]

].forEach(([file, whitelist]) => {
  const size = Math.ceil(fs.statSync(file).size / 1024);
  const sample = require(file);
  const mask = masker({whitelist});
  new Benchmark(file, () => mask(sample), {
    onComplete: function () {
      console.log(`${this.name}\t${size}kB\t${this.hz}\t${1000 / this.hz}`);
    }
  }).run();
});
