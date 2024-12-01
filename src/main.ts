import "./style.css";

const PADDING = 0;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 800;
const DRAW_PLAYER_OFFSET_X = 5;
const DRAW_PLAYER_OFFSET_Y = 30;
const BOX_SIZE = 40;

const APP_NAME = "Farming Game";
const app = document.querySelector<HTMLDivElement>("#app")!;
document.title = APP_NAME;

const gridDiv = document.createElement("div");
app.append(gridDiv);

//Create canvas
const canvas: HTMLCanvasElement = document.createElement("canvas");
const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;
canvas.height = CANVAS_HEIGHT;
canvas.width = CANVAS_WIDTH;
gridDiv.append(canvas);

interface Player {
  icon: string;
  x: number;
  y: number;
}

interface Cell {
  sunLevel: number;
  waterLevel: number;
  plantType: string | null;
  plantLevel: number | null;
}

const grid: number[] = []; //TODO: Store sun/water levels and plant info as object in array
const player = {icon: "👩‍🌾", x: 0, y: 0};



//Code found at: https://stackoverflow.com/a/11736122
//Draws a grid on the canvas
function drawGrid(){
    for (let x = 0; x <= CANVAS_WIDTH; x += BOX_SIZE) {
        ctx.moveTo(0.5 + x, PADDING);
        ctx.lineTo(0.5 + x, CANVAS_HEIGHT);
    }

    for (let x = 0; x <= CANVAS_HEIGHT; x += BOX_SIZE) {
        ctx.moveTo(PADDING, 0.5 + x);
        ctx.lineTo(CANVAS_WIDTH, 0.5 + x);
    }
    ctx.strokeStyle = "black";
    ctx.stroke();
}

//Displays player on the grid
function displayPlayer() {
  ctx.font = "24px sans-serif";
  const x = (player.x * BOX_SIZE)+ DRAW_PLAYER_OFFSET_X;
  const y = (player.y * BOX_SIZE)+ DRAW_PLAYER_OFFSET_Y;
  ctx.fillText(player.icon, x, y);
}

drawGrid();
displayPlayer();