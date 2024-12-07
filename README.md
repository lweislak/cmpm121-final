# Devlog Entry - 11/20/24

Introducing the Team
--------------------------------------------
Tools Lead: Victoria Morgan,
Engine Lead: Lo Weislak,
Design Lead: Victoria Morgan

Tools and Materials
--------------------------------------------
Our team will be using TypeScript + HTML5 for the final game. It was recommended to switch from our original platform choice, Unity.
We both have knowledge of using GitHub for version control.

Visual Studio will be the primary IDE.

We will be utilizing free, premade assets. We may use a tile editor such as Tiled.

Phaser is our alternate engine choice.

Outlook
--------------------------------------------
Our team is hoping to implement particle effects when sowing and reaping plants to add more "juice" to the game.

The visual design is going to be the most difficult part of the project. This includes making the visuals look cohesive.

We hope to gain more knowledge about implementing game systems on a short time frame.
We don't have to come up with the premise, so it'll be a good test of how to make a game based on given guidelines.

# Devlog Entry 12/07/2024

F0 complete!

How we satisfied the software requirements
--------------------------------------------

F0.a: We implemented a character you can control over a 2D grid. You can control the character with the arrow keys, and can move in any of the four cardinal directions. Movement off of the grid is restricted, with the edge of the screen functioning as a wall. Interact with plants (reap or sow) with E.

F0.b: Time passes manually in this turn-based game. Move, reap, water, or sow, every action takes up time. Every few actions (according to our TURN variable) the plants all have a chance of growing or dying from malnutrition.

F0.c: We implemented reaping and sowing nearby plants by having the player only be able to interact with the space they are currently on. Move onto a plant and interact to water or reap, move onto an empty tile to plant based on the currently selected plant seed.

F0.d: Grid cells have randomly generated sun levels and water levels, with the sun level being purely random chance and the water level accumulating over time. The higher the sun level, the more the water level drops. Increase the water level by watering the plants enough to survive.

F0.e: Each plant has a distinct type, 🥔, 🥕, or 🌽. You can select which type to plant with the on-screen buttons. Each plant has exactly three growth stages, 🌱, 🌾, and then the final harvestable stage that is equal to their plant type.

F0.f: The simple spatial rules that govern plant growth are as follows: Plants check to see if they grow every few actions. If a plant has zero water, it dies. If it doesn't die, a plant checks it's cardinal neighbors; if a neighboring plant type matches it's "desired" plant type, one level is added to the water and sun for the tile. If the plant has more than 10 water and at least 2 sun, they grow to the next stage. Planting a plant in the center of a bunch of it's desired plant thus increases sun and water a lot, making it more likely to grow to the next stage.

F0.g: Play concludes when a certain amount of plants have been successfully harvested, currently five of each. Plants can be lost but harvested ingredients cannot, meaning a player can successfully win the game by planting each plant, watering it excessively, and harvesting it five times over per plant type.