const toWorker = fileOrWorker =>
  typeof fileOrWorker === 'string' 
    ? new Worker(fileOrWorker)
    : fileOrWorker

const workerSource = fileOrWorker => {
  const w = toWorker(fileOrWorker)
  return (start, sink) => {
    if (start !== 0) return
    const onMsg = ev => {
      const {type, data} = JSON.parse(ev.data)
      if (type !== 0) sink(type, data)
    }
    if (w.addEventListener) w.addEventListener('message', onMsg)
    else w.onmessage = onMsg
    sink(0, (t, d) => {
      w.postMessage(JSON.stringify({type: t, data: d}))
      if (t === 2) (w.close || w.terminate).call(w)
    })
  }
}

const workerSink = fileOrWorker => source => {
  const w = toWorker(fileOrWorker)
  let talkback;
  const onMsg = ev => {
    const {type, data} = JSON.parse(ev.data)
    talkback(type, data)
  }
  source(0, (t, d) => {
    if (t === 0) {
      talkback = d
      if (w.addEventListener) w.addEventListener('message', onMsg)
      else w.onmessage = onMsg
      w.postMessage(JSON.stringify({type: 0}))
    }
    if (t === 1) w.postMessage(JSON.stringify({type: t, data: d}))
    if (t === 2) {
      w.postMessage(JSON.stringify({type: t, data: d}))
      const close = w.close || w.terminate
      close.call(w);
    }
  })
}

module.exports = {workerSource, workerSink};
