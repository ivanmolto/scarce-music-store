import React from 'react';

import SVGIconContainer from './SVGIconContainer';
import BasicSVG from './BasicSVG';

export default class Previous extends BasicSVG {
  render() {
    return (
      <SVGIconContainer {...this.props}>
        <path d="M1.59999575,15.9999575 C0.715198099,15.9999575 0,15.2847594 0,14.3999617 L0,1.59999575 C0,0.715198099 0.715198099,7.10542736e-15 1.59999575,7.10542736e-15 C2.4847934,7.10542736e-15 3.1999915,0.715198099 3.1999915,1.59999575 L3.1999915,14.3999617 C3.1999915,15.2847594 2.4847934,15.9999575 1.59999575,15.9999575 Z M5.59999841,6.75042458 L13.5999771,0.350441587 C14.0815759,-0.0335573928 14.7407741,-0.108757193 15.2943726,0.158442097 C15.8463712,0.425641387 16.1999702,0.984039903 16.1999702,1.60003827 L16.1999702,14.4000043 C16.1999702,15.0160026 15.8463712,15.5760011 15.2943726,15.8432004 C15.0719732,15.9488001 14.8351739,16 14.5999745,16 C14.2431754,16 13.8895764,15.8816003 13.5999771,15.6496009 L5.59999841,9.24961794 C5.22079941,8.94561875 5,8.48641997 5,8.00002126 C5,7.51522255 5.22079941,7.05442377 5.59999841,6.75042458 Z"/>
      </SVGIconContainer>
    );
  }
}