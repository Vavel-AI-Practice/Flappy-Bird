import { BehaviorSubject } from "rxjs";
import Emitter from './Emitter';

import { GameModel, getDefaultGameData } from "../models/models";
import Player from "../models/Player";
import { config } from "../config";

export class GameLogic {
    private timerId?: NodeJS.Timeout | null;
    private playerId: string;
    private canTimerBeRun: boolean;
    private isStarted: boolean;
    private gameData: GameModel;
    private players: Player[] = [];

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

        const defaultValue = valueToUpdate.getValue();

        this.updateGameData(defaultValue);
    }

    public start = () => {
        this.canTimerBeRun = true;
        this.startMoving();

        this.isStarted = true;
    }

    public stop = (): void => {
        this.canTimerBeRun = false;
        this.isStarted = false;

        if (!this.timerId) {
            return;
        }

        clearTimeout(this.timerId);
    }

    private updateGameData = (model: GameModel | null = null) => {
        if (model == null) {
            model = { ...this.gameData };
        } else {
            this.resetPlayers(model);
        }
        this.gameData = model;

        Emitter.emit(this.playerId, this.gameData);
    }

    private reset = () => {
        this.stop();

        this.updateGameData(getDefaultGameData(this.players.length));
    }

    private resetPlayers = (data: GameModel) => {
        this.players = Array.from({ length: data.y.length }, x => (new Player()));
    }

    private startMoving = () => {
        if (!this.canTimerBeRun) {
            return;
        }

        this.timerId = setTimeout(
            () => {
                const canContinue = this.changeGameData();

                if (canContinue) {
                    this.start();
                } else {
                    this.stop();
                }
            }, 10

        )
    }

    private changeGameData = (): boolean => {
        this.changePlayerPosition();
        this.changeColumnPosition();

        if (this.players.every(x => x.isGameOver)) {
            this.gameData.isGameOver = true;
        }

        this.updateGameData();

        return !this.gameData.isGameOver;
    }

    private changePlayerPosition() {
        this.players.forEach((player, index) => {
            if (!player.isGameOver) {
                let currentPosition = player.move();

                if (this.checkCollision(index)) {
                    currentPosition = player.gameOver();
                }

                this.gameData.y[index] = currentPosition;
            }
        })
    }

    private changeColumnPosition() {
        this.gameData.columns.forEach((column) => {
            this.gameData.score += column.move();
        })
    }

    private checkCollision = (index: number) => {
        for (let i = 0; i < this.gameData.columns.length; i++) {
            const column = this.gameData.columns[i];
            const aboveTheHole = this.gameData.y[index] - config.radius < column.height1;
            const belowTheHole = this.gameData.y[index] + config.radius > column.height1 + config.columnHoleHeight;
            const incideColumn = config.defaultPlayerX + config.radius > column.x && config.defaultPlayerX - config.radius < column.x + config.columnWidth;

            if (incideColumn && (aboveTheHole || belowTheHole)) {
                return true;
            }
        }

        return false;
    }

    private onKeyPress = (event: KeyboardEvent) => {
        if (event.key !== " " && !Number.isInteger(+event.key) && !this.gameData.isGameOver && event.key !== 'r') {
            return
        }

        if (this.gameData.isGameOver || event.key === 'r') {
            this.reset();
            return;
        }

        if (!this.isStarted) {
            this.start();
        }

        this.players.forEach((player, index) => {
            if (event.key === " " || (Number.isInteger(+event.key) && +event.key === index)) {
                player.jump();
            }
        })
    }

    private getRandomString = (): string => {
        return this.getRandomNumber(100, 200).toString();
    }

    private getRandomNumber = (min: number, max: number): number => {
        return Math.floor(Math.random() * Math.floor(max)) + min;
    }
}