import { config } from "../config";
import { Column } from "./Column";

export type GameModel = {
    y: number[],
    columns: Column[],
    isGameOver: boolean,
    score: number;
    generation: number,
    maxSore: number;
}

export const getDefaultGameData = (playersCount: number, maxScore: number = 0) => {
    return {
        y: new Array(playersCount).fill(config.defaultPosition),
        dist: new Array(playersCount).fill(config.width - config.defaultPlayerX),
        hole: new Array(playersCount).fill(config.defaultPosition),
        columns: [new Column(), new Column(config.width / 2 + config.columnWidth)],
        isGameOver: false,
        score: 0,
        generation: 0,
        maxSore: maxScore
    }
}