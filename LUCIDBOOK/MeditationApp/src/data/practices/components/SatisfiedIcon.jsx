import * as React from "react"
import Svg, { Path } from "react-native-svg"

const SatisfiedIcon = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.width || 24}
    height={props.height || 24}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <Path
      d="M11.9982 15.9978C14.207 15.9978 15.9977 14.2072 15.9977 11.9983C15.9977 9.78951 14.207 7.9989 11.9982 7.9989C9.78939 7.9989 7.99878 9.78951 7.99878 11.9983C7.99878 14.2072 9.78939 15.9978 11.9982 15.9978Z"
      stroke={props.color || "#FFD93D"}
      strokeWidth={1.99972}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M11.9983 1.99969V3.99969"
      stroke={props.color || "#FFD93D"}
      strokeWidth={1.99972}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M11.9983 19.9972V21.9972"
      stroke={props.color || "#FFD93D"}
      strokeWidth={1.99972}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M4.9292 4.92932L6.3392 6.33932"
      stroke={props.color || "#FFD93D"}
      strokeWidth={1.99972}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M17.6575 17.6575L19.0675 19.0675"
      stroke={props.color || "#FFD93D"}
      strokeWidth={1.99972}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M1.99976 11.9983H3.99976"
      stroke={props.color || "#FFD93D"}
      strokeWidth={1.99972}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M19.9973 11.9983H21.9973"
      stroke={props.color || "#FFD93D"}
      strokeWidth={1.99972}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M6.3392 17.6575L4.9292 19.0675"
      stroke={props.color || "#FFD93D"}
      strokeWidth={1.99972}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M19.0675 4.92932L17.6575 6.33932"
      stroke={props.color || "#FFD93D"}
      strokeWidth={1.99972}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
)

export default SatisfiedIcon