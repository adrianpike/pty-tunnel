const WAIT_TIME = 60;
const PORT_LOWER = 20000;
const PORT_RANGE = 100;

const Fs = require('fs');
const Path = require('path');
const Pty = require('pty.js');
const Tls = require('tls');

const Port = Math.floor(Math.random() * PORT_RANGE + PORT_LOWER);

var cmd = process.argv[2];
var args = process.argv.slice(3);

if (!cmd) {
  console.error('No command provided to pipe to.');
  process.exit(2);
}

Child = Pty.spawn(cmd, args, { });

Child.on('exit', function() {
  console.error('Child process stopped, we\'re done here.');
  process.exit(0);
});

const server = Tls.createServer({ 
  key: Fs.readFileSync(Path.join(__dirname, 'keys', 'key.pem')),
  cert: Fs.readFileSync(Path.join(__dirname, 'keys', 'cert.pem'))
}, (c) => {
  console.log('Connection from', c.remoteAddress);
  c.pipe(Child.stdin);
  Child.stdout.pipe(c);
  Child.stdin.write("\n");
  c.on('end', function() {
    process.exit(1);
  });
});

server.listen(Port);

console.log(`Our port is: ${Port}`);
console.log(`Pipe opened to ${cmd} with args ${args.join(' ')}. Closing in ${WAIT_TIME} seconds unless we get a connection...`);

var killer = setTimeout(function() {
  process.exit(0); 
}, WAIT_TIME * 1000);
