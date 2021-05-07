import { config } from "../config";
import { Column } from "./Column";

export type GameModel = {
    y: number[],
    columns: Column[],
    isGameOver: boolean,
    score: number;
}

export const getDefaultGameData = (playersCount: number) => {
    return {
        y: new Array(playersCount).fill(config.defaultPosition),
        columns: [new Column(), new Column(config.width / 2 + config.columnWidth)],
        isGameOver: false,
        score: 0
    }
}