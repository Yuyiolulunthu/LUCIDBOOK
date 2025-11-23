import * as React from "react"
import Svg, { G, Path, Defs, ClipPath, Rect } from "react-native-svg"

const ClockIcon = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.width || 16}
    height={props.height || 16}
    viewBox="0 0 16 16"
    fill="none"
    {...props}
  >
    <G clipPath="url(#clip0_1747_1389)">
      <Path
        d="M7.9971 14.6615C11.6777 14.6615 14.6614 11.6778 14.6614 7.99719C14.6614 4.31658 11.6777 1.33286 7.9971 1.33286C4.31649 1.33286 1.33276 4.31658 1.33276 7.99719C1.33276 11.6778 4.31649 14.6615 7.9971 14.6615Z"
        stroke={props.color || "#4A5565"}
        strokeWidth={1.33287}
      />
      <Path
        d="M7.99731 3.9986V7.9972L10.663 9.33006"
        stroke={props.color || "#4A5565"}
        strokeWidth={1.33287}
        strokeLinecap="round"
      />
    </G>
    <Defs>
      <ClipPath id="clip0_1747_1389">
        <Rect width={15.9944} height={15.9944} fill="white" />
      </ClipPath>
    </Defs>
  </Svg>
)

export default ClockIcon