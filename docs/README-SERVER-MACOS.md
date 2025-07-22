# Local Server on MacOS

## Configs

Production build configurations are defined in the `server.js` file.

The production port is different from the development port.

## Launch Agent

Create `/Users/_username_/Library/LaunchAgents/com._username_.memorizepronunciation.plist` file in masOS:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>com._username_.memorizepronunciation</string>

    <key>ProgramArguments</key>
    <array>
      <string>/usr/local/bin/node</string>
      <string>/Users/_username_/Projects/JavaScript/MemorizePronunciation/server.js</string>
    </array>

    <key>WorkingDirectory</key>
    <string>/Users/_username_/Projects/JavaScript/MemorizePronunciation</string>

    <key>RunAtLoad</key>
    <true/>

    <key>StandardOutPath</key>
    <string>/tmp/memorizepronunciation.log</string>

    <key>StandardErrorPath</key>
    <string>/tmp/memorizepronunciation-error.log</string>
  </dict>
</plist>
```

## Load and unload app in Terminal

Run in Terminal:

```bash
launchctl list | grep memorizepronunciation
```

You should see a line with your label, e.g.:

```bash
1234 0 com._username_.memorizepronunciation
```

If you don’t see it, try loading it again:

```bash
launchctl load ~/Library/LaunchAgents/com._username_.memorizepronunciation.plist
```

Unload the old version if you've made changes:

```bash
launchctl unload ~/Library/LaunchAgents/com._username_.memorizepronunciation.plist
```

## Logs

Open `tmp` folder with `.log` files:

* memorizepronunciation.log
* memorizepronunciation-error.log

```bash
open/tmp
```
