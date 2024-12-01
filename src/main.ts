import "./style.css";

const APP_NAME = "Farming Game";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

const Plant = {
  x: 0,
  y: 0,
  type: "sunflower",
  growthLevel: 0,
  waterLevel: 0,
  grow: () => {
    Plant.growthLevel++;
    //Update image for plant
  },
};