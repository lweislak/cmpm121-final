import "./style.css";

const PADDING = 0;
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 600;
const DRAW_OFFSET_X = 25;
const DRAW_OFFSET_Y = 60;
const BOX_SIZE = 100;

const GRID_LENGTH = 6;
const GRID_WIDTH = 6;
const TURN = 15;
const MAX_PLANT_LEVEL = 3;
const PLANT_GROWTH_ICONS = ["🌱", "🌾"];
let TIME = 0;


const APP_NAME = "Farming Game";
const app = document.querySelector<HTMLDivElement>("#app")!;
document.title = APP_NAME;

const gridDiv = document.createElement("div");
app.append(gridDiv);

const inventoryDiv = document.createElement("div");
app.append(inventoryDiv);

const buttonDiv = document.createElement("div");
app.append(buttonDiv);

//Create canvas
const canvas: HTMLCanvasElement = document.createElement("canvas");
const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;
canvas.height = CANVAS_HEIGHT;
canvas.width = CANVAS_WIDTH;
gridDiv.append(canvas);

//Create buttons for different seeds
let seedTypes = [
  {"icon": "🥔", "desired": "🌽", "button": null as HTMLButtonElement | null},
  {"icon": "🥕", "desired": "🥔", "button": null as HTMLButtonElement | null},
  {"icon": "🌽", "desired": "🥕", "button": null as HTMLButtonElement | null}
]

//Create player inventory
let inventory = [
  {"icon": "🥔", "amount": 0 as number},
  {"icon": "🥕", "amount": 0 as number},
  {"icon": "🌽", "amount": 0 as number}
]

interface Player {
  icon: string;
  x: number;
  y: number;
  currentSeed: string;
}

interface Cell {
  sunLevel: number;
  waterLevel: number;
  plantIcon: string | null;
  plantLevel: number | null;
  plantType: string | null;
}

let player: Player = {
  icon: "👩‍🌾",
  x: 0,
  y: 0,
  currentSeed: "🥔", //Default
};

interface SaveFile {
  time: number;
  playerX: number;
  playerY: number;
  seed: string;
  savedGrid:Cell[];
}

let grid: Cell[] = [];
const undoStack: SaveFile[] = [];
const redoStack: SaveFile[] = [];

//Code found at: https://stackoverflow.com/a/11736122
//Draws a grid on the canvas
function drawGrid(){
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  for (let x = 0; x <= CANVAS_WIDTH; x += BOX_SIZE) {
      ctx.moveTo(0.5 + x, PADDING);
      ctx.lineTo(0.5 + x, CANVAS_HEIGHT);
  }

  for (let y = 0; y <= CANVAS_HEIGHT; y += BOX_SIZE) {
      ctx.moveTo(PADDING, 0.5 + y);
      ctx.lineTo(CANVAS_WIDTH, 0.5 + y);
  }

  ctx.strokeStyle = "#291702"; //Dark Brown
  ctx.stroke();

   for(let x = 0; x < grid.length; x++) {
    displayPlant(grid[x], x % GRID_LENGTH, Math.floor(x / GRID_WIDTH));
   }
}

//Displays player on the grid
function displayPlayer() {
  ctx.font = "40px sans-serif";
  const x = (player.x * BOX_SIZE) + DRAW_OFFSET_X;
  const y = (player.y * BOX_SIZE) + DRAW_OFFSET_Y;
  ctx.fillText(player.icon, x, y);
}

//Displays plants on the grid
function displayPlant(cell: Cell, x: number, y: number) {
  if(cell.plantIcon != null) {
    ctx.font = "35px sans-serif";
    x = (x * BOX_SIZE) + DRAW_OFFSET_X;
    y = (y * BOX_SIZE) + DRAW_OFFSET_Y;
    ctx.fillText(cell.plantIcon, x , y);

    //Display plant info
    ctx.font = "20px sans-serif";
    ctx.fillStyle = "#dad617"; //Yellow
    ctx.fillText(cell.sunLevel.toString(), x - 15, y - 35);
    ctx.fillStyle = "#5faef8"; //Light blue
    ctx.fillText(cell.waterLevel.toString(), x + 50, y - 35);
  }
}

//Check which key was pressed
function checkKeys(key: string) {
  if(key == "ArrowUp" && player.y > 0) { player.y--; }
  else if(key == "ArrowDown" && player.y < 5) { player.y++; }
  else if(key == "ArrowLeft" && player.x > 0) { player.x--; }
  else if(key == "ArrowRight" && player.x < 5) { player.x++; }
  else if(key == "KeyE") {
    const cell = grid[player.x  + (player.y * GRID_WIDTH)];
    if(!cell.plantLevel) {sow(cell); }
    else if(cell.plantLevel == MAX_PLANT_LEVEL) { reap(cell); }
    else { water(cell); }
  }
  else { return; }
  TIME++;
  checkTurn();
  saveSnapshot();
}

//Check if a turn has passed
function checkTurn() {
  if (TIME % TURN == 0) {
    for(let x = 0; x < (GRID_LENGTH * GRID_WIDTH); x++) {
        grid[x].waterLevel -= grid[x].sunLevel; //Sun level decreases water level each turn
        grid[x].waterLevel += Math.round(Math.random() * 3);
        grid[x].sunLevel = Math.round(Math.random() * 5);
        if(grid[x].waterLevel <= 0) { //If water level gets too low, plant dies
          killPlant(grid[x]);
        }
        checkNeighbors(x);
        water(grid[x]);
        checkGrowth(grid[x]);
    }
  }
}


//Check each cell for growth conditions
function checkGrowth(cell: Cell) {
  if(cell.plantLevel == MAX_PLANT_LEVEL) {return;}
  //If water level is above 10 and there is any sun on the cell, grow the plant
  if(cell.waterLevel >= 10 && cell.sunLevel >= 2) { //Temporary values
    cell.plantLevel!++;
    if(cell.plantLevel == MAX_PLANT_LEVEL) {cell.plantIcon = cell.plantType;}
    else {cell.plantIcon = PLANT_GROWTH_ICONS[cell.plantLevel! - 1];}
  }
}


// Check neighboring cells for synergistic plants
// Increase the cell's water if compatible
function checkNeighbors(index: number) {
  const cell = grid[index];
  if (cell.plantLevel == null) {return;}
  for (const seed of seedTypes) {
    const cellsToCheck = [
    index - 1, //left
    index + 1, //right
    index - GRID_LENGTH, //up
    index + GRID_LENGTH //down
    ];
    if (cell.plantType == seed.icon) {
      cellsToCheck.forEach((neighborIndex) => {
        if((0 < neighborIndex) && (neighborIndex < GRID_LENGTH * GRID_WIDTH)
        && (grid[neighborIndex]).plantType == seed.desired) {
          cell.waterLevel++;
        }
      });
    }
  }
}


function killPlant(cell: Cell) {
  cell.plantIcon = null;
  cell.plantLevel = 0;
  cell.waterLevel = 0;
}

function sow(cell: Cell) {
  cell.plantLevel = 1;
  cell.plantIcon = PLANT_GROWTH_ICONS[0];
  cell.plantType = player.currentSeed;
  displayPlant(cell, player.x, player.y);
}

function water(cell: Cell) {
  cell.waterLevel++;
}

function reap(cell: Cell) {
  for(const obj of inventory) {
    if(obj.icon == cell.plantIcon) {
      obj.amount++;
      updateInventory();
    }
  }
  killPlant(cell);
  if(checkWin()) { console.log("YOU WIN"); }
}

function checkWin(): boolean {
  for(const element of inventory) {
    if(element.amount < 5) { return false;}
  }
  return true;
}

function updateInventory() {
  for(let i = 0; i < inventory.length; i++) {
    const newNode = document.createTextNode(`${inventory[i].icon!}: ${inventory[i].amount.toString()}\n`);
    inventoryDiv.replaceChild(newNode, inventoryDiv.childNodes[i]);
  }
}

//Setup seed buttons
function setButtons() {
  for(const seed of seedTypes) {
    if(!seed.button) {
      seed.button = document.createElement("button");
      seed.button.innerText = seed.icon;
      buttonDiv.append(seed.button!);
    }
    seed.button!.addEventListener("click", function() {
      player.currentSeed = seed.icon;
    });
  }

  buttonDiv.append(document.createElement("br"));

  const undoButton = document.createElement("button");
  undoButton.innerText = "Undo";
  buttonDiv.append(undoButton);
  undoButton.addEventListener("click", () => {
    if (undoStack.length > 0) {
      const snapshot = undoStack.pop();
      TIME = snapshot!.time;  
      player.x = snapshot!.playerX;
      player.y = snapshot!.playerY;
      player.currentSeed = snapshot!.seed;
      for(let x = 0; x < (CANVAS_HEIGHT * CANVAS_WIDTH) / BOX_SIZE; x++) {
          grid[x] = snapshot!.savedGrid[x];
          // grid[i][j].plantIcon = snapshot!.savedGrid[i][j].plantIcon;
          // grid[i][j].sunLevel = snapshot!.savedGrid[i][j].sunLevel;
          // grid[i][j].waterLevel = snapshot!.savedGrid[i][j].waterLevel;
          // grid[i][j].plantType = snapshot!.savedGrid[i][j].plantType;
          // grid[i][j].plantLevel = snapshot!.savedGrid[i][j].plantLevel;
      }
      redoStack.push(snapshot!);
      drawGrid();
      displayPlayer();
    }
  });

  const redoButton = document.createElement("button");
  redoButton.innerText = "Redo";
  buttonDiv.append(redoButton);
  redoButton.addEventListener("click", () => {
    if (redoStack.length > 0) {
      const snapshot = redoStack.pop();
      TIME = snapshot!.time;  
      player.x = snapshot!.playerX;
      player.y = snapshot!.playerY;
      player.currentSeed = snapshot!.seed;
      for(let x = 0; x < (CANVAS_HEIGHT * CANVAS_WIDTH) / BOX_SIZE; x++) {
        grid[x] = snapshot!.savedGrid[x];
      }
      undoStack.push(snapshot!);
      drawGrid();
      displayPlayer();
    }
  });

  buttonDiv.append(document.createElement("br"));

  const Save1Button = document.createElement("button");
  Save1Button.innerText = "Save to File 1";
  buttonDiv.append(Save1Button);
  Save1Button.addEventListener("click", () => {
    saveGame("save1");
  });

  const Save2Button = document.createElement("button");
  Save2Button.innerText = "Save to File 2";
  buttonDiv.append(Save2Button);
  Save2Button.addEventListener("click", () => {
    saveGame("save2");
  });

  const Save3Button = document.createElement("button");
  Save3Button.innerText = "Save to File 3";
  buttonDiv.append(Save3Button);
  Save3Button.addEventListener("click", () => {
    saveGame("save3");
  });

  buttonDiv.append(document.createElement("br"));

  const Load1Button = document.createElement("button");
  Load1Button.innerText = "Load game in File 1";
  buttonDiv.append(Load1Button);
  Load1Button.addEventListener("click", () => {
    loadGame("save1");
  });

  const Load2Button = document.createElement("button");
  Load2Button.innerText = "Load game in File 2";
  buttonDiv.append(Load2Button);
  Load2Button.addEventListener("click", () => {
    loadGame("save2");
  });

  const Load3Button = document.createElement("button");
  Load3Button.innerText = "Load game in File 3";
  buttonDiv.append(Load3Button);
  Load3Button.addEventListener("click", () => {
    loadGame("save3");
  });
}

//save a snapshot of the game state
function saveSnapshot() {
  const snapGrid: Cell[] = [];
  for(let x = 0; x < (CANVAS_HEIGHT * CANVAS_WIDTH) / BOX_SIZE; x++) {
    snapGrid[x] = (Object.assign({}, grid[x]));
  }
  const snapshot: SaveFile = {
    time: TIME,
    playerX: player.x,
    playerY: player.y,
    seed: player.currentSeed,
    savedGrid: snapGrid
  }
  undoStack.push(snapshot);
}

function saveGame(filename: string) {
  const gameInfo = {
    player,
    grid,
    TIME,
    inventory,
    seedTypes,
    undoStack,
    redoStack,
  };
  localStorage.setItem(filename, JSON.stringify(gameInfo));
}

function loadGame(filename: string) {
  const gameInfoJSON = localStorage.getItem(filename);
  //localStorage.deleteItem(filename); //FOR TESTING ONLY. Causes error and resets loading
  if (gameInfoJSON) {
    const gameInfo = JSON.parse(gameInfoJSON);

    player = gameInfo.player;
    grid = gameInfo.grid;
    TIME = gameInfo.TIME;
    inventory = gameInfo.inventory;
    seedTypes = gameInfo.seedTypes;

    gameInfo.undoStack.forEach((saveFile: SaveFile) => {
      undoStack.push(Object.assign({}, saveFile));
    });
    gameInfo.redoStack.forEach((saveFile: SaveFile) => {
      redoStack.push(saveFile);
    });
  }
  drawGrid();
  displayPlayer();
  updateInventory();
}

//Check for unexpected quits and reload game upon launch
globalThis.addEventListener("beforeunload", () => {saveGame("autoSave");});
globalThis.addEventListener("load", () =>  {loadGame("autoSave");});

addEventListener("keydown", (e) => {
  const key = e.code;
  checkKeys(key);
  drawGrid();
  displayPlayer();
});

//Populate grid with cells
for(let x = 0; x < (GRID_LENGTH * GRID_WIDTH); x++) {
    const cell: Cell = {
      sunLevel: Math.round(Math.random() * 5),
      waterLevel: 0,
      plantIcon: null,
      plantLevel: null,
      plantType: null,
    }
    grid[x] = cell;
}

//Display inventory
for(const element of inventory) {
  const txt = document.createTextNode(`${element.icon!}: ${element.amount.toString()}\n`);
  inventoryDiv.appendChild(txt);
  //inventoryDiv.append(document.createElement('br'));
}

drawGrid();
displayPlayer();
setButtons();
saveSnapshot();
