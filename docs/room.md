# The room

How the 3D room (`/world`, and `/` for most visitors) is built, the rules that keep it fast and usable, and the phone test it still has to pass. For what the room says and shows, see the header of `src/lib/data/world.ts`.

## Principles

- The thesis is "Come spend a minute in my world." Visitors should remember the site because they understood Aditya better, not because it used 3D. When cleverness and usability pull apart, choose usability.
- It's one room, not an engine. The scene uses Three.js directly: one module, explicit disposal, direct raycasting, and a render loop that stops completely at rest. Svelte owns all the semantic UI. Threlte was considered and set aside; revisit it only if composing the scene becomes the main maintenance cost.
- Only the room loads Three.js. On paper (`/index`) and the deep pages never import the scene, even indirectly.

## Where things live

- `src/lib/data/world.ts`: everything the room says: stations, panels, hints, curiosities, the poem, and the playlist. Facts stay in their own data files; `world.ts` only selects and frames them.
- `src/lib/world/layout.ts`: positions, hitboxes, approach points, and furniture footprints. It has no Three.js import, so it's unit-tested.
- `src/lib/world/build.ts`: builds the furniture from primitives, placed from their footprints so a model and its footprint can't drift apart.
- `src/lib/world/scene.ts`: renderer, camera, input, movement, and the mirror.
- `src/lib/components/world/WorldView.svelte`: room state, navigation history, dialogs, and scene lifecycle. `RoomMenu.svelte` owns the guide and settings UI; `MusicDock.svelte` owns the music controls and their responsive layout. `RecordPlayer.svelte` loads SoundCloud's hosted playlist widget only on request. The API has a ten-second readiness limit; the playlist gets thirty seconds, with a loading message, retry, and fallback link. Errors on an individual track keep the loaded playlist available so the visitor can choose another. Audio is hosted by SoundCloud; the site does not store music files or implement its own audio player.
- `src/lib/world/time.ts`: the window's Bengaluru time of day.
- Cards: the favourite Pokémon cards are listed in `src/lib/data/collection.ts`, with originals in `assets/cards/<id>.png`. `npm run images` derives the 400px WebPs and the shelf's texture atlas. List order is shelf order, and a unit test fails if an image is missing or the atlas is stale.
- Flag: `npm run images` also renders `static/room/flag.webp` from `assets/flag/manutd-crest.png`; its size and position are `FLAG` in `layout.ts`.

## Rendering budget

| Measure                     | Budget    | Last measured                                         |
| --------------------------- | --------- | ----------------------------------------------------- |
| Draw calls                  | < 150     | 13–15, plus 4 while the character shows in the mirror |
| Triangles                   | < 15k     | ~12.9k                                                |
| Lazy scene JavaScript, gzip | < 200 KB  | ~137 KB                                               |
| Textures                    | As needed | 2: card atlas (54 KB), flag (14.5 KB)                 |

`npm run perf` measures a proxy: headless Chromium, software WebGL, and a phone-sized viewport with a 4× CPU throttle. It can't measure GPU cost or heat, so it doesn't replace the phone test below.

To stay inside the budget:

- Use one fixed orthographic camera. There's no orbiting, physics, shadows, postprocessing, or perpetual decorative animation. The only camera move is a 480 ms push-in toward an open station and back; reduced motion cuts straight to the framing.
- Static furniture is merged into one lit and one unlit mesh, so draw calls stay flat however much furniture the room gains. Only the character, markers, and objects that change colour are separate meshes.
- Render frames only for movement, camera easing, resizing, input, or state changes, and clamp long frame deltas. Rendering stops when the tab is hidden, the window loses focus, or the room is torn down. The one exception is the gramophone: while the record plays, the room renders about 30 frames a second.
- Render at the screen's real pixel density, with antialiasing, capped at 6 million drawing-buffer pixels. Low power renders at 1×.
- Textures load after the room is up, with a plain stand-in until then.
- Add instanced meshes, optimized GLB models, compressed textures, or lazy downloads only when real assets need them.

## Layout

- Portrait screens use a longer floor plan (7 × 8.68 room units instead of 7 × 6.2), with furniture at its original size. Movement, taps, hitboxes, camera focus, the mirror, walking speed, and saved positions all go through the same mapping. Rotating the phone swaps layouts without moving the character to a different logical position.
- The scene frames the room in the space the overlays leave (`setInsets`), so the header, hint, controls, and reading sheets never cover it.
- The mirror reflects only the character. A second fixed orthographic camera looks along the room camera's view reflected in the glass and renders the character's meshes (layer 1) into a small 4× multisampled texture. It runs only on frames where the character could show in the mirror. The mirror's approach point is where the reflection is centred, and a unit test checks it.
- The hallway behind the door is separate from the room's static geometry and drawn through a stencil of the doorway. Its passes run only while the door is open, so a closed door shows nothing outside and an open one never reveals the back of the set.

## Input and accessibility

- Keyboard movement belongs to a focused room. The room takes focus on arrival unless the visitor has already focused something or a `/world#station` link opened a station. Tab always leaves the room, so it never traps the keyboard.
- WASD and the arrow keys move relative to the screen, with diagonals normalized. E or Enter opens the nearest station within a generous radius, and E closes it again (key repeat is ignored). Escape also closes. An open sheet takes focus, so Space, the arrows, Page Up/Down, and the mouse wheel scroll it. Closing the menu, a station, or the poem gives the keyboard back to the room.
- Tapping or clicking the floor walks there; tapping an object walks to its approach point and opens it. Furniture is solid: keyboard movement slides along the nearest edge, and a click walks around it by the shortest route.
- On touch and narrow screens, a joystick sits at the bottom left, with Enter above Menu at the bottom right; tap-to-walk still works. Movement stops on release, cancellation, blur, resize, a hidden tab, menus, and reading sheets.
- Switching music on opens its player on every screen size. Playback starts, pauses, and track changes leave that choice unchanged. The visible Hide button uses a minus icon; Show player reopens it without reloading the iframe or interrupting the music. On phones the hidden player becomes the gramophone button between the movement controls. Other room readers temporarily cover the music card, which returns in its previous state when they close.
- The room menu is a native `popover` in the server-rendered HTML. Every station is a link in it, so it works without JavaScript. It also lists the curiosities with their notes, and the room settings.
- Without WebGL, or after a context loss or failed scene load, the page shows a still of the room, a link to On paper, and the same menu, which opens the same content.
- Native dialogs handle focus containment and Escape. Closing returns focus to whatever opened the station.
- Reduced motion turns off the walking bounce, camera easing, the door swing, and sheet slide-ins, and makes moves immediate.

## Choosing My room or On paper

`/` is rendered on the server from a `mode` cookie (`src/lib/server/mode.ts`), with `Vary: Cookie` and `Cache-Control: private, no-cache`. First-time visitors get the room. Visiting `/world` or `/index` opens that mode and stores it as the preference for a year. Because the server makes the choice, there's no flash of the wrong mode. Don't move it to `localStorage`, and don't host `/` statically.

## Real-phone test (not yet passed)

Automated browser tests and resized screenshots don't count. Run this on a modern mid-range physical phone, against the live site or a branch preview, and record the results in `WORKLOG.md`: device, OS, browser, connection, Low power setting, cold and warm load, and frame time while moving.

1. Portrait: the whole room is legible, controls are at least 44px, and nothing scrolls sideways.
2. Tap several floor points, then the desk. The character gets there quickly and reliably.
3. Open and close a station, scroll its content, and confirm On paper is always reachable.
4. Rotate to landscape and back. The room fits without stretching or disappearing.
5. Try Low power, reduced motion, backgrounding and resuming, and five minutes of use.
6. Check for idle rendering, stalls, and heat. Target a p95 frame time of 33 ms or less (30 fps) while moving.
7. Disable WebGL 2 or force a context loss, and a failed scene load. On paper stays usable.
8. On an iPhone, put the record on. If Safari blocks playback from starting, the player card should ask the visitor to press play.
