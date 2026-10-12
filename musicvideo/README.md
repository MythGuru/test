# TikTok Famous: music video

A real-time 3D music video for the song "TikTok Famous". A pencil sketches a girl and her dog on a sheet of paper. They come to life in 3D and act out the song, timed to its beats and words.

## Layout

- `web/`: the player. Open `index.html` through any static web server (with `song.mp3` next to it).
  - `data.js`: beat times, audio energy curves and word-timed lyrics, generated from the song.
  - `core.js`: math, beat clock, renderer and post-processing (bloom, grade, tilt-shift, frame).
  - `world.js`: desk, paper, ring light, phones and pencils.
  - `characters.js`: the girl and dog rigs, hands, drawings and dance moves.
  - `physics.js`: arm IK with collision, ponytail and skirt simulation, dog springs, separation.
  - `fx.js`: particles, cards, icons, floating screens, paper fans and props.
  - `story.js`: the timeline: choreography, camera moves, lighting and cues.
  - `main.js`: render loop, audio sync, lyrics, controls and the capture hook.
- `tools/`: audio analysis (Python with librosa and faster-whisper) and the headless renderers.
- `previews/`: rendered preview clips.

## Rendering an MP4

Serve `web/` on `http://localhost:8765/`, wrapped in a page called `test.html`. Then run:

```
node tools/render.cjs 1920 1080 16x9    # landscape
node tools/render.cjs 1080 1920 9x16    # vertical
```

Frames render in resumable 20-second chunks. The chunks are then joined with the song into H.264/AAC MP4 files with faststart.
