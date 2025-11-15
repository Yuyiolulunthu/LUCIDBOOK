import * as React from "react"
import Svg, { Path } from "react-native-svg"

const DepressedIcon = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.width || 24}
    height={props.height || 24}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <Path
      d="M3.99997 14.8983C3.25706 14.1392 2.69662 13.2211 2.36111 12.2134C2.02559 11.2057 1.92381 10.1348 2.06345 9.08194C2.2031 8.02906 2.58052 7.02177 3.16712 6.13636C3.75372 5.25095 4.53412 4.51064 5.44921 3.97151C6.36431 3.43238 7.39009 3.10857 8.44886 3.0246C9.50764 2.94063 10.5716 3.0987 11.5603 3.48685C12.5489 3.875 13.4362 4.48304 14.1551 5.26492C14.8739 6.04679 15.4054 6.98201 15.7092 7.99971H17.4991C18.4646 7.9996 19.4045 8.31001 20.18 8.8851C20.9554 9.46018 21.5254 10.2694 21.8056 11.1933C22.0859 12.1172 22.0615 13.1067 21.7362 14.0157C21.4109 14.9247 20.8018 15.7049 19.999 16.2412"
      stroke={props.color || "#A0A0C0"}
      strokeWidth={1.99988}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M15.999 13.9991V19.9991"
      stroke={props.color || "#A0A0C0"}
      strokeWidth={1.99988}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7.99951 13.9991V19.9991"
      stroke={props.color || "#A0A0C0"}
      strokeWidth={1.99988}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M11.9993 15.999V21.999"
      stroke={props.color || "#A0A0C0"}
      strokeWidth={1.99988}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
)

export default DepressedIcon