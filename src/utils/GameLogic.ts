import { BehaviorSubject } from "rxjs";
import Emitter from './Emitter';

import { GameModel, getDefaultGameData } from "../models/models";
import Player from "../models/Player";
import { config } from "../config";
import { GeneticLogic } from "./GeneticLogic";

export class GameLogic {
    private timerId?: NodeJS.Timeout | null;
    private playerId: string;
    private canTimerBeRun: boolean;
    private isStarted: boolean;
    private gameData: GameModel;
    private players: Player[] = [];
    private genetic: GeneticLogic = new GeneticLogic();

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

        this.updateGameData(defaultValue, true);
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

    private updateGameData = (model: GameModel | null = null, isInit: boolean = false) => {
        if (model == null) {
            model = { ...this.gameData };
        } else {
            this.resetPlayers(model, isInit);
        }
        this.gameData = model;

        Emitter.emit(this.playerId, this.gameData);
    }

    private reset = (isInit: boolean) => {
        this.stop();

        const maxScore = this.gameData.score > this.gameData.maxSore ? this.gameData.score : this.gameData.maxSore;
        this.updateGameData(getDefaultGameData(this.players.length, maxScore), isInit);
    }

    private resetPlayers = (data: GameModel, isInit: boolean) => {
        this.players = Array.from({ length: data.y.length }, x => (new Player()));
        if (isInit) {
            this.genetic.init(data.y.length);
        } else {
            data.generation = this.genetic.nextGeneration();
        }
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
                    this.createNewGenerationAndStartAgain();
                }
            }, 10
        )
    }

    private createNewGenerationAndStartAgain() {
        // if (this.gameData.generation === 1) {
        //     return;
        // }
        this.reset(false);
        this.start();
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

    private getDataForNN(index: number): number[] {
        const pipe = this.gameData.columns
            .filter(x => x.x + config.columnWidth - config.defaultPlayerX + config.radius > 0)
            .sort((unitA, unitB) => {
                return unitA.x - unitB.x
            })[0]
        const distToPipes = pipe.x + config.columnWidth + config.radius - config.defaultPlayerX;
        const distToHole = pipe.height1 + (config.columnHoleHeight / 2) - this.gameData.y[index];

        return [distToPipes, distToHole];
    }

    private changePlayerPosition() {
        this.players.forEach((player, index) => {
            if (!player.isGameOver) {
                let isNeedToJump = this.isNeedToJump(index);
                if (isNeedToJump) {
                    player.jump();
                }

                let currentPosition = player.move();

                if (this.checkCollision(index)) {
                    currentPosition = player.gameOver();
                    this.genetic.fillFitness(index, player.distance);
                    player.clearDistance();
                }

                this.gameData.y[index] = currentPosition;
            }
        })
    }

    public isNeedToJump(index: number): boolean {
        const dataForNN = this.getDataForNN(index);
        const outputs = this.genetic.feedForward(index, dataForNN);
        return outputs[0] > 0.5;
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
            this.reset(event.key === 'r');
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