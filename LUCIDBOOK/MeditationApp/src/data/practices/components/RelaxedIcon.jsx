import * as React from "react"
import Svg, { Path } from "react-native-svg"

const RelaxedIcon = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.width || 24}
    height={props.height || 24}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <Path
      d="M10.9993 19.9988C9.24347 20.0041 7.54977 19.3493 6.25411 18.1643C4.95846 16.9793 4.15549 15.3506 4.00447 13.6013C3.85345 11.8519 4.3654 10.1097 5.43879 8.7202C6.51219 7.33067 8.06861 6.39531 9.79937 6.09962C15.499 4.99969 16.9989 4.47972 18.9988 1.99988C19.9987 3.99975 20.9987 6.17962 20.9987 9.99938C20.9987 15.499 16.219 19.9988 10.9993 19.9988Z"
      stroke={props.color || "#7FC8A9"}
      strokeWidth={1.99988}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M1.99976 20.9993C1.99976 17.9993 3.84976 15.6393 7.07976 14.9993C9.49976 14.5193 11.9998 12.9993 12.9998 11.9993"
      stroke={props.color || "#7FC8A9"}
      strokeWidth={1.99988}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
)

export default RelaxedIcon