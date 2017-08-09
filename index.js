const WAIT_TIME = 60;
const PORT_LOWER = 20000;
const PORT_RANGE = 100;

const Fs = require('fs');
const Path = require('path');
const Pty = require('node-pty');
const Tls = require('tls');

const Port = Math.floor(Math.random() * PORT_RANGE + PORT_LOWER);

var killer = null;

var cmd = process.argv[2];
var args = process.argv.slice(3);

if (!cmd) {
  console.error('No command provided to pipe to.');
  process.exit(2);
}

Child = Pty.spawn(cmd, args, { });

Child.on('error', function(err) {
  console.error('Unable to start process.', err);
  process.exit(0);
});

Child.on('exit', function(err) {
  console.error('Child process stopped, we\'re done here.');
  process.exit(0);
});

var bufs = [];
var bufferListener = function(data) {
  bufs.push(data);
};
Child.on('data', bufferListener);

const server = Tls.createServer({ 
  key: Fs.readFileSync(Path.join(__dirname, 'keys', 'key.pem')),
  cert: Fs.readFileSync(Path.join(__dirname, 'keys', 'cert.pem'))
}, (c) => {
  clearTimeout(killer);
  console.log('Connection from', c.remoteAddress);
  c.pipe(Child);

  Child.removeListener('data', bufferListener);
  Child.on('data', function(data) {
    c.write(data);
  });

  c.write(bufs.join(''));

  c.on('end', function() {
    process.exit(1);
  });
});

server.listen(Port);

console.log(`Our port is: ${Port}`);
console.log(`Pipe opened to ${cmd} with args ${args.join(' ')}. Closing in ${WAIT_TIME} seconds unless we get a connection...`);

killer = setTimeout(function() {
  process.exit(0); 
}, WAIT_TIME * 1000);
