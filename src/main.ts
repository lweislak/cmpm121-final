import "./style.css";

const PADDING = 0;
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 600;
const DRAW_OFFSET_X = 25;
const DRAW_OFFSET_Y = 60;
const BOX_SIZE = 100;
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
const seedTypes = [
  {"icon": "🥔", "button": null as HTMLButtonElement | null},
  {"icon": "🥕", "button": null as HTMLButtonElement | null},
  {"icon": "🌽", "button": null as HTMLButtonElement | null}
]

//Create player inventory
const inventory = [
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

const player: Player = {
  icon: "👩‍🌾",
  x: 0,
  y: 0,
  currentSeed: "🥔", //Default
};

const grid: Cell[][] = [];

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

  for(let i = 0; i < CANVAS_HEIGHT/BOX_SIZE; i++) {
    for(let j = 0; j < CANVAS_WIDTH/BOX_SIZE; j ++) {
      displayPlant(grid[i][j], i, j);
    }
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
//TODO: Simplify displayPlayer() and displayPlant() into one function, displayIcon()
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
    //ctx.fillStyle = "black";
    //ctx.fillText(cell.plantLevel!.toString(), x + 50, y + 35);
  }
}

//Check which key was pressed
function checkKeys(key: string) {
  //Note: 8 is the number of cells in the 2D array
  if(key == "ArrowUp" && player.y > 0) { player.y--; }
  else if(key == "ArrowDown" && player.y < 7) { player.y++; }
  else if(key == "ArrowLeft" && player.x > 0) { player.x--; }
  else if(key == "ArrowRight" && player.x < 7) { player.x++; }
  else if(key == "KeyE") {
    const cell = grid[player.x][player.y];
    if(!cell.plantLevel) {sow(cell); }
    else if(cell.plantLevel == MAX_PLANT_LEVEL) { reap(cell); }
    else { water(cell); }
  }
  else { return; }
  TIME++;
  checkTurn();
}

//Check if a turn has passed
function checkTurn() {
  if (TIME % TURN == 0) {
    for(let i = 0; i < CANVAS_HEIGHT/BOX_SIZE; i++) {
      for(let j = 0; j < CANVAS_WIDTH /BOX_SIZE; j++) {
        grid[i][j].waterLevel -= grid[i][j].sunLevel; //Sun level decreases water level each turn
        grid[i][j].waterLevel += Math.round(Math.random() * 3);
        grid[i][j].sunLevel = Math.round(Math.random() * 5);
        if(grid[i][j].waterLevel <= 0) { //If water level gets too low, plant dies
          killPlant(grid[i][j]);
        }
        checkGrowth(grid[i][j]);
      }
    }
  }
}

//Check each cell for growth conditions
function checkGrowth(cell: Cell) {
  if(cell.plantLevel == MAX_PLANT_LEVEL) {return;}
  //If water level is above 10 and there is any sun on the cell, grow the plant
  if(cell.waterLevel >= 10 && cell.sunLevel >= 0) { //Temporary values
    cell.plantLevel!++;
    if(cell.plantLevel == MAX_PLANT_LEVEL) {cell.plantIcon = cell.plantType;}
    else {cell.plantIcon = PLANT_GROWTH_ICONS[cell.plantLevel! - 1];}
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
    if(element.amount < 5) {  console.log("RETURN FALSE"); return false;}
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
  for(let i = 0; i < seedTypes.length; i++) {
    if(!seedTypes[i].button) {
      seedTypes[i].button = document.createElement("button");
      seedTypes[i].button!.innerText = seedTypes[i].icon;
      buttonDiv.append(seedTypes[i].button!);
    }
    seedTypes[i].button!.addEventListener("click", function() {
      player.currentSeed = seedTypes[i].icon;
    });
  }
}


//Populate grid with cells
for(let i = 0; i < CANVAS_HEIGHT/BOX_SIZE; i++) {
  grid[i] = [];
  for(let j = 0; j < CANVAS_WIDTH /BOX_SIZE; j++) {
    const cell: Cell = {
      sunLevel: Math.round(Math.random() * 5),
      waterLevel: 0,
      plantIcon: null,
      plantLevel: null,
      plantType: null,
    }
    grid[i][j] = cell;
  }
}

//Display inventory
for(let i = 0; i < inventory.length; i++) {
  const txt = document.createTextNode(`${inventory[i].icon!}: ${inventory[i].amount.toString()}\n`);
  inventoryDiv.appendChild(txt);
  //inventoryDiv.append(document.createElement('br'));
}

addEventListener("keydown", (e) => {
  const key = e.code;
  checkKeys(key);
  drawGrid();
  displayPlayer();
});

drawGrid();
displayPlayer();
setButtons();
