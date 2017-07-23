const WAIT_TIME = 60;

const Fs = require('fs');
const Path = require('path');
const Pty = require('pty.js');
const Tls = require('tls');

const Port = Math.floor(Math.random() * 1000 + 20000);

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

console.log(`Pipe opened to ${cmd} with args ${args.join(' ')}. Closing in ${WAIT_TIME} seconds without a connection...`);
console.log(`openssl s_client -quiet -connect localhost:${Port}`);

var killer = setTimeout(function() {
  process.exit(0); 
}, WAIT_TIME * 1000);
