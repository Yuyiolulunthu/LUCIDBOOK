import React from 'react';
import Svg, { Path } from 'react-native-svg';

const StartPlayerIcon = ({ width = 19, height = 22, color = '#31C6FE' }) => (
  <Svg width={width} height={height} viewBox="0 0 19 22" fill="none">
    <Path 
      d="M18 8.93128C19.3333 9.70108 19.3333 11.6256 18 12.3954L3 21.0556C1.66667 21.8254 0 20.8632 0 19.3236V2.00308C0 0.463475 1.66667 -0.498775 3 0.271026L18 8.93128Z" 
      fill={color}
    />
  </Svg>
);

export default StartPlayerIcon;