const test = require('tape');
const {fromIter, pipe, map, filter, forEach} = require('callbag-basics');
const Worker = require('tiny-worker');
const {workerSource, workerSink} = require('./index');

test('works as a sink in the worker, as a source in the main', function(t) {
  t.plan(4);
  const worker = new Worker(function() {
    const {fromIter, pipe} = require('callbag-basics');
    const {workerSink} = require(__dirname + '/index');
    pipe(
      fromIter([10,20,30]),
      workerSink(self)
    )
  });
  const expected = [1,2,3];

  pipe(
    workerSource(worker),
    map(x => x / 10),
    forEach(x => {
      t.equals(x, expected.shift())
    })
  )

  setTimeout(() => {
    t.pass('nothing else happens');
    t.end();
  }, 1200);
});

test('works as a source in the worker, as a sink in the main', function(t) {
  t.plan(1);
  const worker = new Worker(function() {
    const {pipe, map, forEach} = require('callbag-basics');
    const {workerSource} = require(__dirname + '/index');
    const expected = [1,2,3];
    pipe(
      workerSource(self),
      map(x => x / 10),
      forEach(x => {
        const e = expected.shift()
        if (x !== e) {
          throw new Error('expected ' + e + ' but got ' + x);
        }
      })
    )
  });
  worker.onerror = err => {
    t.fail(err);
  };
  
  pipe(
    fromIter([10,20,30]),
    workerSink(worker)
  )

  setTimeout(() => {
    t.pass('nothing else happens');
    t.end();
  }, 1200);
});

