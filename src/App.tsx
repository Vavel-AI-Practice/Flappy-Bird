import React from 'react';
import { Layer, Stage } from 'react-konva';
import { Game } from './Game';
import { config } from './config';

import './App.css';

export const App = () => {
  return (
    <Stage width={config.width} height={config.height} className='canvas'>
      <Layer>
        <Game />
      </Layer>
    </Stage>
  );
}