import { useEffect, useRef } from 'react';
import { Circle, Rect, Text } from 'react-konva';
import { BehaviorSubject } from 'rxjs';
import { config } from './config';
import { useObservable } from './hooks/useObservable';
import { GameModel, getDefaultGameData } from './models/models';
import GameData from './utils/GameData';

export const Game: React.FC = () => {
    const gameDataObservable = useRef<BehaviorSubject<GameModel>>(new BehaviorSubject<GameModel>(getDefaultGameData()));
    const gameData = useObservable<GameModel>(gameDataObservable.current, getDefaultGameData());

    useEffect(() => {
        const playerPositionService = new GameData(gameDataObservable.current);

        return () => playerPositionService.stop();
    }, [])

    return (
        <>
            <Circle
                x={config.defaultPlayerX} y={gameData.y} radius={config.radius}
                fill='yellow' stroke='black'
                strokeWidth={2}
            />
            {gameData.columns.map((columnData, index) =>
                <>
                    <Rect
                        key={`${index}-1`}
                        width={config.columnWidth}
                        height={columnData.height1}
                        x={columnData.x}
                        y={0}
                        fill={"green"}
                        stroke={"black"}
                        strokeWidth={5} />
                    <Rect
                        key={`${index}-2`}
                        width={config.columnWidth}
                        height={columnData.height2}
                        x={columnData.x}
                        y={columnData.height1 + config.columnHoleHeight}
                        fill={"green"}
                        stroke={"black"}
                        strokeWidth={5} />
                </>
            )}
            {gameData.isGameOver && <Text fontSize={60} text="GAME OVER!!!"
                wrap="char" align="center" fill={"red"} />}
        </>
    );
}