# Manually Generate a Certificate for a Local IP

1. Run the app with `server.host: true` set in the `vite.config.ts` file. This will allow Vite to bind to all available network interfaces. Check the terminal output to find the list of network IPs accessible from other devices on your local network.
2. Choose your preferred local IP (e.g. 192.168.100.92) and update your `vite.config.ts` config:

```ts
server: {
host: '192.168.100.92',
port: 5173,
}
```

3. Install mkcert on your computer
4. Set up your local certificate authority:

```bash
mkcert-install
```

This command installs a local trusted certificate authority (CA) on your development machine, which is required to generate trusted HTTPS certificates. Using trusted HTTPS certificates prevents your site from showing dangerous site warnings **in Chrome browser** (it may not work for other browsers).

5. Generate an HTTPS certificate for your development IP:

```bash
mkcert192.168.100.92
```

This will generate two files:

* 192.168.100.92.pem
* 192.168.100.92-key.pem

6. Place these certificate files in a `certificate/` folder, and configure your Vite dev server to use them in `vite.config.ts`:

```ts
importfsfrom'fs';

server: {
host: '192.168.100.92',
port: 5173,
https: {
key: fs.readFileSync('certificate/192.168.100.92-key.pem'),
cert: fs.readFileSync('certificate/192.168.100.92.pem')
  }
}
```

7. Now, when you run the app with `npm run dev`, you can access it securely from other devices on your network via:

```bash
https://192.168.100.92:5173
```
