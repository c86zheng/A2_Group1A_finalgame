# Chromasight

## Setup and Interaction Instructions

To run the sketch locally, open `index.html` in Google Chrome using Live Server.

**Controls:**

- Click `Start` on the title screen to enter the game.
- Move: `A` / `D` or Left / Right Arrow
- Jump: `W` or Up Arrow
- Climb / move down: `W` / `S` or Up / Down Arrow when overlapping a ladder
- Use portal: stand inside a portal trigger and press `W`
- Switch vision mode: `Q` or `E` after collecting a vision key
- Respawn: `R`

The game begins in Color Blindness mode. The player collects a key to unlock another vision mode, then uses `Q` and `E` to shift vision. Mode blocks are controlled through Tiled object properties: each block can render as a different tile and can either have collision or no collision depending on the current mode. This allows the same space to change function as the player changes visual mode.

The current prototype uses a small interconnected level structure rather than completely separate linear stages. The first playable section teaches movement, key collection, vision switching, mode-based blocks, ladder interaction, tutorial text, and portal progression.

**Opening the Chrome Console**

- **Windows:** Press `F12` or `Ctrl + Shift + J`, then click the **Console** tab
- **Mac:** Press `Cmd + Option + J`

The console will show any errors in the sketch.

## Project Structure

| File | Purpose |
|------|---------|
| `index.html` | Loads p5.js, p5.sound, and the project scripts |
| `sketch.js` | Handles p5 lifecycle functions, asset loading, input, and audio helpers |
| `game.js` | Stores game configuration and the main `ChromasightGame` class |
| `scenes.js` | Stores scene drawing helpers, Tiled parsing helpers, collision helpers, and animation helpers |
| `assets/map/Start.tmj` | Tiled start screen map and clickable Start object |
| `assets/map/level_1.tmj` | Main playable Tiled map |
| `assets/map/tiles_packed.tsx` | Tiled tileset definition |

## Assets

| File | Source |
|------|--------|
| `assets/img/tiles_packed.png` | Game asset tileset by Piens Factory [1], modified for this project |
| `assets/img/robotFighter.png` | Cute Animated Robot Character by Ryder Studios Game Assets [2], modified for this project |
| Book collectible tile | Roguelike/RPG Items from OpenGameArt [3], modified for this project |
| Mode block tiles | Drawn by a team member for this project |
| `assets/img/Start.png` | Start screen image created for this project |
| `assets/sound/bgm.wav` | Loading Screen Loop from OpenGameArt [4] |
| `assets/sound/buttonon.mp3` | Technology Button On sound effect from Pixabay [5] |
| `assets/map/Start.tmj` | Tiled map created for this project |
| `assets/map/level_1.tmj` | Tiled map created for this project |

## References

[1] Piens Factory. 2022. _Game Assets_. Patreon. Retrieved 2026, from https://www.patreon.com/Piensfactory/posts/game-assets-73297576

[2] Ryder Studios Game Assets. n.d. _Cute Animated Robot Character_. itch.io. Retrieved 2026, from https://ryder-studios-game-assets.itch.io/cute-animated-robot-character

[3] OpenGameArt. n.d. _Roguelike/RPG Items_. Retrieved 2026, from https://opengameart.org/content/roguelikerpg-items

[4] OpenGameArt. n.d. _Loading Screen Loop_. Retrieved 2026, from https://opengameart.org/content/loading-screen-loop

[5] Pixabay. n.d. _Technology Button On Sound Effect_. Retrieved 2026, from https://pixabay.com/sound-effects/technology-buttonon-521345/

[6] McCarthy, L., Reas, C., and Fry, B. n.d. _p5.js Reference_. Processing Foundation. Retrieved 2026, from https://p5js.org/reference/

[7] Processing Foundation. n.d. _p5.sound Reference_. Retrieved 2026, from https://p5js.org/reference/#/libraries/p5.sound

[8] Tiled. n.d. _Tiled Map Editor Documentation_. Retrieved 2026, from https://doc.mapeditor.org/

[9] OpenAI. 2026. _ChatGPT_. Used to assist with code organization, debugging, README drafting, and prototype iteration.

## GenAI Use Statement

I used GenAI. I used ChatGPT GPT-5 to help organize the JavaScript architecture, debug p5.js and Tiled integration issues, refine gameplay logic, and prepare this README in a clear submission format.
