import { config } from "../config";

export type GameModel = {
    y: number,
    columns: Column[],
    isGameOver: boolean
}

export class Column {
    public height1: number = 0;
    public height2: number = 0;
    public x: number = config.width;

    constructor(margin: number = 0) {
        this.fillColumnData(margin);
    }

    public move() {
        this.x -= 2;
        if (this.x + config.columnWidth < 0) {
            this.fillColumnData();
        }
    }

    public fillColumnData(margin: number = 0): void {
        const availableHeight = config.height - config.columnHoleHeight - config.bottomMargin;

        this.height2 = Math.random() * (availableHeight - config.bottomMargin * 2) + config.bottomMargin * 2;
        this.height1 = availableHeight - this.height2;

        this.x = config.width + margin + 5;
    }
}

export const getDefaultGameData = () => {
    return {
        y: config.defaultPosition,
        columns: [new Column(), new Column(config.width / 2 + config.columnWidth)],
        isGameOver: false
    }
}