# callbag-worker

Callbag utilities for communicating with a Web Worker. Provides a callbag source and sink to create a communication bridge. Works with both listenables and pullables.

`npm install callbag-worker`

## example

In the main JS thread:

```js
// main.js
const {pipe, map, forEach} = require('callbag-basics')
const {workerSource} = require('callbag-worker')

pipe(
  workerSource(new Worker('worker.js')), // or workerSource('worker.js')
  map(x => x / 2),
  forEach(x => console.log(x))
)
// 0.5
// 1.5
// 2.5
// 3.5
// 4.5
```

In `worker.js`:

```js
// worker.js
const {pipe, interval, filter, take} = require('callbag-basics')
const {workerSink} = require('callbag-worker')

pipe(
  interval(1000),
  filter(x => x % 2),
  take(5),
  workerSink(self)
)
```

----------

Now the other way around, `workerSink` in `main.js` and `workerSource` in `worker.js`:

```js
// main.js
const {pipe, interval, filter, take} = require('callbag-basics')
const {workerSink} = require('callbag-worker')

pipe(
  interval(1000),
  filter(x => x % 2),
  take(5),
  workerSink(new Worker('worker.js'))
)
```

```js
// worker.js
const {pipe, map, forEach} = require('callbag-basics')
const {workerSource} = require('callbag-worker')

pipe(
  workerSource(self),
  map(x => x / 2),
  forEach(x => console.log(x))
)
// 0.5
// 1.5
// 2.5
// 3.5
// 4.5
```

## API

- **`workerSource(filenameOrWorker) => Callbag`**

A source factory which knows how to receive callbag messages from the "other side" referenced by the input `filenameOrWorker`, which can be a string for the filename of the worker, or the JS `Worker` object itself. In case this function is called inside a worker, the input should be `self`.

- **`workerSink(filenameOrWorker) => Callbag`**

A callbag sink which knows how to send callbag messages to the "other side" referenced by the input `filenameOrWorker`, which can be a string for the filename of the worker, or the JS `Worker` object itself. In case this function is called inside a worker, the input should be `self`.

