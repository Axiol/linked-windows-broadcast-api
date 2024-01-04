export enum OtherWindowActionType {
  ADD = 'ADD',
  REMOVE = 'REMOVE',
  UPDATE = 'UPDATE',
}

export type WindowState = {
  screenX: number;
  screenY: number;
  innerWidth: number;
  innerHeight: number;
}

export type OtherWindow = {
  id: string;
  windowState: WindowState;
}

export type BroadcastMessage = {
  type: OtherWindowActionType;
  id: string;
  windowState?: WindowState;
}

export type Coordinates = {
  x: number;
  y: number;
};