 your intent, and your future goals.

This README is structured to guide AI refactors, not end-users.
It tells Codex what must NEVER change and what the engine design is.



 


---

SPACE-JUNKZ SHOOTER — DEV ARCHITECTURE README

Overview

Space-Junkz Shooter is a modular 2D arcade shooter built around the idea of a single engine powering unlimited levels.
The original version of the game was a  “nebula background shooter,” space themed cross pyramids of giza  and the goal of the rebuild is to turn that prototype into a scalable shooter engine supporting:

10+ handcrafted levels

unique enemy waves & multiple boss types

keep modular upgrades and shields

a persistent homebase crafting system a leaderboard api that creates add player logins online leaderboards for xp an wizz coins tracking

a mission map (world map) for selecting levels = homebase

seamless flow from level → blackhole warp → world map


This document defines the stable architecture, rules Codex must follow, and the future goals for the project.


---

Core Principles

1. One Engine Rules All Levels

There is only ONE game engine, located under:

/src/game/engine/
    engine.js
    collisions.js
    renderer.js
    input.js
    levelManager.js

This engine controls:

game loop

rendering

collision handling

input / movement

enemy updates

boss updates

shared gameplay systems

starfield stars across screen ment to add fx to background nebulas 

bullets / rockets

particles

powerups x 5 atm 

shield / health systems


Levels do NOT override engine functions.
They only supply:

enter()

update(dt)

draw(ctx)

finish()


Everything else comes from the engine.


---

2. Levels Are Fully Modular

Levels live under:

/src/game/levels/
    Level1.js     (Intro mission)
    lvl2.js       (Mission 1)
    lvl3.js
    lvl4.js
    ...
    lvl10.js

Each level handles:

its own enemy wave timing

its own boss logic

its own background calls (if unique)

its own finish conditions


Each level must call:

updateGame(dt)
drawGameCore()

Levels must NOT:

redefine window.updateGame

redefine window.gameLoop

change the engine loop

modify global engine modes

manipulate unrelated engine systems



---

3. LevelManager orchestrates level loading

LevelManager:

registers levels (register(name, object))

starts a level (startLevel("LevelName"))

tells engine whether a level is active

calls each level's update/draw

transitions back to the World Map when finished


This keeps all gameplay isolated and clean.


---

4. World Map → Level → Blackhole → World Map

After defeating a level boss:

1. Level calls finish()


2. LevelManager marks it as done


3. A “Blackhole Warp” animation triggers (optional)


4. Player returns to the World Map


5. Next mission can be selected


6. OR player can go to Homebase to craft/upgrade



This must remain consistent, even with 100+ levels.


---

5. Homebase & Crafting System

Homebase is a persistent upgrade station.
It handles:

shield crafting atm the shield is just a drop in game like piwer ups an wizz coins thta also drop,, this will move to a crafting t homebase once coded 

shield A/B system

weapon upgrades 

wizzcoin economy

unlocks earned from levels


After each level:

Player can warp to Homebase
The Homebase code is modular and must NOT be overwritten by Codex.


---

6. Shield System (A/B)

A/B shield system remains exactly as in the old engine:

Shield A =drops from eneimies small chance after lvl 1 

Shield B = same as part a 

Bosses drop shield topups not writien yet 



Codex must never remove or rewrite shield logic. but can tidy it if needed 


---




---

8. Engine Flow

Startup

initGame() →
show HUD →
WorldMap.enter() →
player chooses level →
LevelManager.startLevel("LevelName")

Level Gameplay

LevelX.enter() →
LevelX.update(dt) →
shared engine updateGame(dt) →
LevelX.draw(ctx) →
shared engine drawGameCore() →
boss defeated →
LevelX.finish()

Return to map

WorldMap.enter()


---

9. Future Expansion Goals

A. Add more levels (Level11–Level100)

Using the same modular structure:

register Level
enter()
update()
draw()
finish()

B. Crafting Upgrade Tree

Future updates:

shield crafting tree

weapon crafting

engine boosters

new resource types

boss-specific loot




D. Endless Mode

A procedural infinite wave mode unlocked after finishing all main missions.

E. Boss Rush

All bosses in mixed order, fast-paced.


---

10. Rules for Codex

Codex MUST follow these strict rules:

Do NOT modify:

engine loop

gameLoop

updateGame

shield system

player movement engine

collisions

world map core logic

file structure


Allowed to modify under instruction:

individual level files

blackhole transition

camera shake

mission descriptions

enemy patterns within levels


Never rewrite entire files unless instructed.

Never merge engine logic into level files.

Never introduce new globals.


---

11. End Goal

Space-Junkz becomes a fully modular shooter with:

a stable engine

unlimited modular levels

persistent homebase crafting

shield system

world map progression

blackhole warp transitions

player stats & leaderboard


The game must scale cleanly without rewriting the engine ever again. once set 


---


