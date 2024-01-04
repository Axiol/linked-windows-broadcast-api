import {Coordinates, WindowState} from './types';

export const getCurrentWindowState = (): WindowState => ({
  screenX: window.screenX,
  screenY: window.screenY,
  innerWidth: window.innerWidth,
  innerHeight: window.innerHeight,
})

export const getCurrentWindowCenter = (win: WindowState): Coordinates => ({
  x: win.innerWidth / 2,
  y: win.innerHeight / 2,
});