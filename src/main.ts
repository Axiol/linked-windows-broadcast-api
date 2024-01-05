// import type { WindowState } from './types';
import {v4 as uuidv4} from 'uuid';
import {getCurrentWindowCenter, getCurrentWindowState} from "./utils.ts";
import {BroadcastMessage, Coordinates, OtherWindow, OtherWindowActionType, WindowState} from "./types.ts";

const otherWindowList: OtherWindow[] = [];

const id = uuidv4();
let currentWindowState = getCurrentWindowState();

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d")!;
const center = getCurrentWindowCenter(currentWindowState);

// Connect to the BroadcastChannel and add the new window to the list.
const bc= new BroadcastChannel('window-state');
bc.postMessage({type: OtherWindowActionType.ADD, id, windowState: currentWindowState} as BroadcastMessage);

// Remove the window from the list when it is closed.
window.addEventListener('beforeunload', () => {
  bc.postMessage({type: OtherWindowActionType.REMOVE, id});
});

// Handle the different actions that can be sent from the other windows.
bc.onmessage = (ev) => {
  const broadcastMessage = ev.data as BroadcastMessage;

  // Add a new window to the list.
  if (broadcastMessage.type === OtherWindowActionType.ADD) {
    const duplicateWindow = otherWindowList.find((window) => window.id === broadcastMessage.id)
    if(duplicateWindow) {
      return;
    }

    otherWindowList.push({id: broadcastMessage.id, windowState: broadcastMessage.windowState!});
    ctx.reset();
    drawCenteredCircle(ctx, center);

    bc.postMessage({type: OtherWindowActionType.ADD, id, windowState: currentWindowState} as BroadcastMessage);

    otherWindowList.forEach((window) => {
      drawConnectingLine({ctx, hostWindow: currentWindowState, targetWindow: window});
    });

    return;
  }

  // Update the window in the list.
  if (broadcastMessage.type === OtherWindowActionType.UPDATE) {
    const index = otherWindowList.findIndex((window) => window.id === broadcastMessage.id);
    otherWindowList[index].windowState = broadcastMessage.windowState!;
    ctx.reset();
    drawCenteredCircle(ctx, center);

    otherWindowList.forEach((window) => {
      drawConnectingLine({ctx, hostWindow: currentWindowState, targetWindow: window});
    });

    return;
  }

  // Remove a window from the list.
  if (broadcastMessage.type === OtherWindowActionType.REMOVE) {
    const index = otherWindowList.findIndex((window) => window.id === broadcastMessage.id);
    otherWindowList.splice(index, 1);
    ctx.reset();
    drawCenteredCircle(ctx, center);

    otherWindowList.forEach((window) => {
      drawConnectingLine({ctx, hostWindow: currentWindowState, targetWindow: window});
    });

    return;
  }
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

const baseChange = ({
  currentWindowOffset,
  targetWindowOffset,
  targetPosition,
}: {
  currentWindowOffset: Coordinates;
  targetWindowOffset: Coordinates;
  targetPosition: Coordinates;
}) => {
  const monitorCoordinate = {
    x: targetPosition.x + targetWindowOffset.x,
    y: targetPosition.y + targetWindowOffset.y,
  };

  return {
    x: monitorCoordinate.x - currentWindowOffset.x,
    y: monitorCoordinate.y - currentWindowOffset.y,
  };
};

const drawConnectingLine = ({
  ctx,
  hostWindow,
  targetWindow,
}: {
  ctx: CanvasRenderingContext2D;
  hostWindow: WindowState;
  targetWindow: OtherWindow;
}) => {
  ctx.strokeStyle = "#ff0000";
  ctx.lineCap = "round";
  const currentWindowOffset: Coordinates = {
    x: hostWindow.screenX,
    y: hostWindow.screenY,
  };
  const targetWindowOffset: Coordinates = {
    x: targetWindow.windowState.screenX,
    y: targetWindow.windowState.screenY,
  };

  const origin = getCurrentWindowCenter(hostWindow);
  const target = getCurrentWindowCenter(targetWindow.windowState);

  const targetWithBaseChange = baseChange({
    currentWindowOffset,
    targetWindowOffset,
    targetPosition: target,
  });

  ctx.strokeStyle = "#ff0000";
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(targetWithBaseChange.x, targetWithBaseChange.y);
  ctx.stroke();
  ctx.closePath();
};

const main = () => {
  drawCenteredCircle(ctx, center);

  setInterval(() => {
    currentWindowState = getCurrentWindowState();
    bc.postMessage({type: OtherWindowActionType.UPDATE, id, windowState: currentWindowState} as BroadcastMessage);
  }, 100);
}

main();