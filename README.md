pty-tunnel
==========

A simple TLS tunnel to a PTY. An easy way to provide a `heroku run`-like
experience.

Gen you up some self-signed keys;
```
$ openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

Fire up a tunnel:

```bash
$ pty-tunnel docker-compose -f ~/src/adrians-example-app/docker-compose.yml run web rails c
```

Connect to it:

```bash
$ stty raw; openssl s_client -quiet -connect HOST:PORT; reset
```
