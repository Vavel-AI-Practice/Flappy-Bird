import { useEffect, useRef } from 'react';
import { Circle, Rect, Text } from 'react-konva';
import { BehaviorSubject } from 'rxjs';
import { config } from './config';
import { useObservable } from './hooks/useObservable';
import { GameModel, getDefaultGameData } from './models/models';
import { GameLogic } from './utils/GameLogic';

export const Game: React.FC = () => {
    const gameDataObservable = useRef<BehaviorSubject<GameModel>>(new BehaviorSubject<GameModel>(getDefaultGameData(100)));
    const gameData = useObservable<GameModel>(gameDataObservable.current);

    useEffect(() => {
        const playerPositionService = new GameLogic(gameDataObservable.current);

        return () => playerPositionService.stop();
    }, [])

    return (
        <>
            {gameData.y.map((y, index) =>
                <Circle
                    key={index}
                    x={config.defaultPlayerX} y={y} radius={config.radius}
                    fill='yellow' stroke='black'
                    strokeWidth={2}
                />
            )}
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

            <Text fontSize={30} text={`Score: ${gameData.score}`} y={config.height - 30}
                wrap="char" align="center" fill={"blue"} />
            <Text fontSize={30} text={`Generation: ${gameData.generation}`} y={config.height - 30}
                wrap="char" align="center" fill={"blue"} x={200} />
            <Text fontSize={30} text={`Max Score: ${gameData.maxSore}`} y={config.height - 60}
                wrap="char" align="center" fill={"blue"} />
        </>
    );
}