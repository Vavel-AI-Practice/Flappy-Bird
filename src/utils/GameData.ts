import Emitter from './Emitter';
import { BehaviorSubject } from 'rxjs';

import { config } from '../config';
import { GameModel, getDefaultGameData } from '../models/models';

class GameData {
    private timerId?: NodeJS.Timeout | null;
    private playerId: string;
    private canTimerBeRun: boolean;
    private isStarted: boolean;
    private gameData: GameModel;
    private dy: number = config.defaultSpeed;

    constructor(valueToUpdate: BehaviorSubject<GameModel>) {
        this.canTimerBeRun = true;
        this.timerId = null;
        this.playerId = this.getRandomString();
        this.isStarted = false;
        this.gameData = {} as GameModel;

        document.addEventListener('keypress', this.onKeyPress);

        Emitter.on(this.playerId, (value: GameModel) => {
            valueToUpdate.next(value);
        });

        this.updateGameData(valueToUpdate.getValue());
    }

    public start = (): GameData => {
        this.canTimerBeRun = true;
        this.startMoving();

        this.isStarted = true;

        return this;
    }

    public stop = (): void => {
        this.canTimerBeRun = false;
        this.isStarted = false;

        if (!this.timerId) {
            return;
        }

        clearTimeout(this.timerId);
    }

    private onKeyPress = (event: KeyboardEvent) => {
        if (event.key !== " " && !this.gameData.isGameOver && event.key !== 'r') {
            return
        }

        if (this.gameData.isGameOver || event.key === 'r') {
            this.reset();
            return;
        }

        if (!this.isStarted) {
            this.start();
        }

        this.dy = -7;
    }

    private startMoving = () => {
        if (!this.canTimerBeRun) {
            return;
        }

        this.timerId = setTimeout(
            () => {
                this.changeGameData();
                if (this.checkCollision()) {
                    this.gameData.isGameOver = true;
                    this.updateGameData();
                    this.stop();
                }
                this.startMoving();
            }, 10

        )
    }

    private changeGameData = (): void => {
        this.changePlayerPosition();
        this.changeColumnPosition();

        this.updateGameData();
    }

    private changePlayerPosition() {
        if (this.gameData.y + config.radius > config.height - config.bottomMargin) {
            //this.dy = -this.dy;
            this.dy = config.defaultSpeed;
            this.gameData.y = 0;
        } else {
            this.dy += config.acceleration
        }

        this.gameData.y = this.gameData.y + this.dy;
    }

    private changeColumnPosition() {
        this.gameData.columns.forEach(column => {
            column.move();
        });
    }

    private checkCollision = () => {
        for (let i = 0; i < this.gameData.columns.length; i++) {
            const column = this.gameData.columns[i];
            const aboveTheHole = this.gameData.y - config.radius < column.height1;
            const belowTheHole = this.gameData.y + config.radius > column.height1 + config.columnHoleHeight;
            const incideColumn = config.defaultPlayerX + config.radius > column.x && config.defaultPlayerX - config.radius < column.x + config.columnWidth;

            if (incideColumn && (aboveTheHole || belowTheHole)) {
                return true;
            }
        }

        return false;
    }

    private reset = () => {
        this.stop();

        this.updateGameData(getDefaultGameData());
    }

    private updateGameData = (model: GameModel = { ...this.gameData }) => {
        this.gameData = model;

        Emitter.emit(this.playerId, this.gameData);
    }

    private getRandomString = (): string => {
        return this.getRandomNumber(100, 200).toString();
    }

    private getRandomNumber = (min: number, max: number): number => {
        return Math.floor(Math.random() * Math.floor(max)) + min;
    }
}

export default GameData;