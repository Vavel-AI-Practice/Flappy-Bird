import { config } from '../config';

class Player {

    private _dy: number = config.defaultSpeed;
    private _y: number = config.defaultPosition;
    private _isGameOver: boolean = false;

    public move(): number {
        if (this._y + config.radius > config.height - config.bottomMargin) {
            //this.dy = -this.dy;
            this._dy = config.defaultSpeed;
            this._y = this.gameOver();
        } else {
            this._dy += config.acceleration
        }

        this._y = this._y + this._dy;

        return this._y;
    }

    public jump() {
        this._dy = -7;
    }

    public reset = () => {
        this._y = config.defaultPosition;
        this._isGameOver = false;
    }

    public gameOver = () => {
        this._isGameOver = true;
        this._y = -config.radius;

        return this._y;
    }

    public get isGameOver() { return this._isGameOver; }
}

export default Player;