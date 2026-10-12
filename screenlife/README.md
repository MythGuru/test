# TikTok Famous: screen-life music video

The whole video plays inside a phone screen: the feed, notifications, comments, chats, calls and settings. Every lyric line becomes something that happens on that screen, timed to the beat and the word.

- `ui.js`: drawing kit for a 1080×1920 phone screen (status bar, icons, notifications, feed posts, chat bubbles, counters).
- `scenes.js`: the scenes and the timeline, each scene a function of song time.
- `player.js`: transitions, edit effects (zoom punches, shake, flashes, glitches, grain), word-by-word captions, and the 9:16 / 16:9 output.
- `data.js`: beat times, audio energy and word-timed lyrics. `song.mp3`: the song.
- `render.cjs`: `node render.cjs <w> <h> <t0> <t1> <out.mp4>` renders song time t0–t1 with matching audio. It needs `test.html` served on port 8766.

Footage slots: register a `<video>` element as `SL.footage.<slot>` (for example `post1`, `selfie`, `ringlight`) and it replaces the placeholder art in every scene that uses that slot.
