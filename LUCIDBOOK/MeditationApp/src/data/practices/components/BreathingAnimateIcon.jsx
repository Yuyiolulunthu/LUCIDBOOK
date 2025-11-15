import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

const BreathingAnimateIcon = ({ width = 217, height = 217 }) => (
  <Svg width={width} height={height} viewBox="0 0 217 217" fill="none">
    <Circle cx="108.5" cy="108.5" r="39.5" fill="#31C6FE" fillOpacity="0.4"/>
    <Circle cx="109" cy="109" r="54" fill="#31C6FE"/>
    <Path 
      d="M99 109L98.3412 110.029C96.7579 112.503 94.023 114 91.0858 114C88.409 114 85.8843 112.756 84.2539 110.633L83 109" 
      stroke="#2B2B2B" 
      strokeWidth="4" 
      strokeLinecap="round"
    />
    <Path 
      d="M121 109L120.341 110.029C118.758 112.503 116.023 114 113.086 114C110.409 114 107.884 112.756 106.254 110.633L105 109" 
      stroke="#2B2B2B" 
      strokeWidth="4" 
      strokeLinecap="round"
    />
    <Path 
      d="M108 132.5C111.798 132.5 115.395 130.795 117.799 127.856L118.5 127" 
      stroke="#2B2B2B" 
      strokeWidth="4" 
      strokeLinecap="round"
    />
  </Svg>
);

export default BreathingAnimateIcon;