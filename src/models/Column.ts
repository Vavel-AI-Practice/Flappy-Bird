import { config } from "../config";

export class Column {
    public height1: number = 0;
    public height2: number = 0;
    public x: number = config.width;

    constructor(margin: number = 0) {
        this.fillColumnData(margin);
    }

    public move(): number {
        this.x -= config.columnSpeed;
        if (this.x + config.columnWidth < 0) {
            this.fillColumnData();

            return 1;
        }

        return 0;
    }

    public fillColumnData(margin: number = 0): void {
        const availableHeight = config.height - config.columnHoleHeight - config.bottomMargin;

        this.height2 = Math.random() * (availableHeight - config.bottomMargin * 2) + config.bottomMargin * 2;
        this.height1 = availableHeight - this.height2;

        this.x = config.width + margin + 5;
    }
}