---

CODEX EXECUTION GUIDE

For Space-Junkz Shooter Engine

This guide defines how Codex must perform development tasks, how to test changes, and how to validate a job before merging.
It prevents accidental rewrites or non-modular changes.


---

1. Codex Working Rules

Codex MUST ALWAYS follow these rules:

Rule 1 — One file per job

Codex may ONLY modify one file per request unless explicitly instructed.

Rule 2 — Replace small blocks only

Codex must NOT rewrite entire files unless the user says:

> “Rewrite this entire file.”



Otherwise, Codex must ONLY:

replace specific lines

modify specific blocks

remove specific blocks

add small functions


Rule 3 — Never change these core systems

Codex must NEVER modify:

updateGame()

drawGame()

window.gameLoop

collisions system

input system

shield system logic

stars / runway core logic

world map bootflow


Unless explicitly told.

Rule 4 — Levels must remain modular

Codex must NOT:

override window.updateGame

override window.gameLoop

override core movement

override core rendering

override engine modes


Levels must ONLY use:

enter()
update(dt)
draw(ctx)
finish()

And must call:

updateGame(dt)
drawGameCore()


---

2. Codex Job Types

Codex now understands three types of jobs:

Job Type A — FIX

Fix small, isolated issues. Examples:

Fix a missing variable

Correct a typo

Remove unused overrides

Patch one function


Behavior:
Modify only necessary lines.
No file rewrites.


---

Job Type B — MODIFY

Add small features or change behavior inside a file.
Example:

Add a new wave pattern

Add a new boss mechanic

Change a cooldown

Add a new HUD indicator


Behavior:
Codex modifies only one file, only one area.


---

Job Type C — ADD

Add brand-new files, modules, or systems.
Examples:

Add Level11.js

Add a new enemy type file

Add a new crafting module


Behavior:
Create new file with minimal boilerplate.
Do NOT duplicate engine logic.


---

3. Codex Testing Instructions

After Codex applies a fix or modification, it must test using the following checklist:


---

ENGINE TEST CHECKLIST

1. Does the game load game.html without console errors?

If there are errors like:

undefined variable

duplicate update loops

missing function


Codex must STOP and fix them.


---

2. Does START GAME launch a level?

When clicking:

World Map Mission 1

or START GAME button


The following must occur:

map disappears

gameplay starts

player spawns

enemies spawn

boss appears

no freeze/white screen



---

3. Does Level return to the map after finishing?

After killing the boss, verify:

LevelX.finish runs

WorldMap.enter() is called

Homebase remains available



---

4. Does Level Manager report only ONE active level?

Codex checks:

LevelManager.hasActiveLevel()

Should return true ONLY when inside a mission.

If more than one level stays active → Codex must fix.


---

5. NO duplicate loops

Codex must check for:

window.updateGame =
window.gameLoop =

Only engine.js may define these.


---

4. Codex Pre-Merge Validation

Before Codex returns a patch, it must confirm:

1. No core engine functions were modified

Unless the job explicitly asked for it.

2. No new global variables were added

Unless the job explicitly allowed.

3. The file structure stays exactly the same

Except for new level or enemy files added deliberately.

4. Level logic remains isolated

5. The fix does not alter:

input

stars

bullets

collisions

shield system

rendering order

player movement


6. All bracket and scope closures are valid

No accidental syntax errors.


---

5. Codex Output Format

Codex must ALWAYS return:

A. “Changed file:”

Name of file changed.

B. “Original code:”

Small snippet for context (3–7 lines).

C. “Replacement code:”

The new block.

D. “Why:”

1–2 sentences explaining the change.

This prevents unexpected rewrites.


---

6. Future Development Goals (For Codex Reference)

A. Scale levels 1–10 to unlimited missions

New levels must follow the modular pattern.

B. Add crafting tree at Homebase

Shields A/B + new weapons.

C. Improve Level Manager with optional:

black hole warp transitions

mission unlock requirements

boss difficulty scaling


D. Maintain minimal engine footprint

The engine should NEVER be rewritten or merged with levels.


---

7. When Codex Is Unsure

Codex must reply:

> “I need clarification. Please specify:
A) file name,
B) block of code,
C) exact change required.”



This prevents hallucinated rewrites.


---

🎯 Now you have BOTH parts the agent needs

1. Architecture README


2. Codex Execution Guide



Together these ensure:

Codex understands the game

Codex stops rewriting your engine

Codex knows the correct workflow

Codex patches levels properly

Codex tests its work

Codex validates before merging



---

