const spawn = require('child_process').spawn
const tapSpec = require('tap-spec')
const glob = require('glob')
const Readable = require('stream').Readable

const s = new Readable()
s._read = () => {}
s.pipe(tapSpec()).pipe(process.stdout)

let hm

function runTestFile (filename) {
  const process = spawn('node', [filename])
  const data = []
  process.stdout.on('data', d => {
    data.push(d)
  })

  process.stderr.on('data', err => {
    console.error(err)
  })

  process.on('exit', () => {
    s.push(data.join(''))
    if (--hm === 0) s.push(null)
  })
}

glob(`${__dirname}/test/*.js`, (err, files) => {
  if (err) console.error(err)
  hm = files.length
  files.forEach(f => runTestFile(f))
})
