// import type { WindowState } from './types';
import { v4 as uuidv4 } from 'uuid';
import {getCurrentWindowCenter, getCurrentWindowState} from "./utils.ts";
import {BroadcastMessage, OtherWindow, OtherWindowActionType, Coordinates} from "./types.ts";

const otherWindowList: OtherWindow[] = [];

const id = uuidv4();
const currentWindowState = getCurrentWindowState();

// Connect to the BroadcastChannel and add the new window to the list.
const bc= new BroadcastChannel('window-state');
bc.postMessage({type: OtherWindowActionType.ADD, id, windowState: currentWindowState} as BroadcastMessage);

// Remove the window from the list when it is closed.
window.addEventListener('beforeunload', () => {
  bc.postMessage({type: OtherWindowActionType.REMOVE, id});
});

// Handle the different actions that can be sent from the other windows.
bc.onmessage = (ev) => {
  console.log("Message received in main.ts: ", ev.data);
  const broadcastMessage = ev.data as BroadcastMessage;

  // Add a new window to the list.
  if (broadcastMessage.type === OtherWindowActionType.ADD) {
    otherWindowList.push({id: broadcastMessage.id, windowState: broadcastMessage.windowState!});
  }

  // Remove a window from the list.
  if (broadcastMessage.type === OtherWindowActionType.REMOVE) {
    const index = otherWindowList.findIndex((window) => window.id === broadcastMessage.id);
    otherWindowList.splice(index, 1);
  }

  console.log(otherWindowList)
}

// Draw a circle in the center of the screen.
const drawCenteredCircle = (ctx: CanvasRenderingContext2D, center: Coordinates) => {
  const { x, y } = center;
  ctx.strokeStyle = "#eeeeee";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(x, y, 100, 0, Math.PI * 2, false);
  ctx.stroke();
  ctx.closePath();
};

const main = () => {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  console.log(canvas);
  const ctx = canvas.getContext("2d")!;
  const center = getCurrentWindowCenter(currentWindowState);
  drawCenteredCircle(ctx, center);
}

main();