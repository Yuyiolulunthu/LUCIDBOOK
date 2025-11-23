import * as React from "react"
import Svg, { Path } from "react-native-svg"

const TiredIcon = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.width || 24}
    height={props.height || 24}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <Path
      d="M6.99976 16.2997C9.19976 16.2997 10.9998 14.4697 10.9998 12.2497C10.9998 11.0897 10.4298 9.98965 9.28976 9.05965C8.14976 8.12965 7.28976 6.74965 6.99976 5.29965C6.70976 6.74965 5.85976 8.13965 4.70976 9.05965C3.55976 9.97965 2.99976 11.0997 2.99976 12.2497C2.99976 14.4697 4.79976 16.2997 6.99976 16.2997Z"
      stroke={props.color || "#A8C5DD"}
      strokeWidth={1.99988}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12.5591 6.59958C13.2469 5.50078 13.7344 4.28877 13.9991 3.01981C14.499 5.51965 15.9989 7.9195 17.9988 9.5194C19.9987 11.1193 20.9986 13.0192 20.9986 15.0191C21.0043 16.4013 20.5995 17.754 19.8355 18.9059C19.0715 20.0578 17.9826 20.9568 16.707 21.4892C15.4314 22.0215 14.0265 22.163 12.6703 21.8959C11.3141 21.6288 10.0678 20.965 9.08936 19.9888"
      stroke={props.color || "#A8C5DD"}
      strokeWidth={1.99988}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
)

export default TiredIcon