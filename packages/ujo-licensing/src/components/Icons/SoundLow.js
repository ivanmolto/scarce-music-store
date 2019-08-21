import React from 'react';

import SVGIconContainer from './SVGIconContainer';
import BasicSVG from './BasicSVG';

export default class SoundLow extends BasicSVG {
  render() {
    return (
      <SVGIconContainer {...this.props}>
        <path d="M9.01010587,6.60734812 C9.83820751,6.60734812 10.51029,7.23387002 10.51029,8.0089631 C10.51029,8.78405619 9.83820751,9.41057809 9.01010587,9.41057809 L9.01010587,13.615423 C9.01010587,14.1816755 8.64406095,14.6946666 8.08449227,14.9105153 C7.89846943,14.9833993 7.7034455,15.017038 7.50992174,15.017038 C7.11987387,15.017038 6.73582673,14.8740733 6.44929157,14.6063648 L2.38829313,10.8121931 L1.50018413,10.8121931 C0.672082489,10.8121931 0,10.1856712 0,9.41057809 L0,6.60734812 C0,5.83225503 0.672082489,5.20573313 1.50018413,5.20573313 L2.38829313,5.20573313 L6.44929157,1.41156137 C6.87834423,1.01069949 7.52192322,0.888758982 8.08449227,1.10741092 C8.64406095,1.32325963 9.01010587,1.83625071 9.01010587,2.40250317 L9.01010587,6.60734812 Z M11.9137123,4.76366377 C13.3388872,5.30188392 14.2600002,6.57455033 14.2600002,8.00840246 C14.2600002,9.4436562 13.3388872,10.7163226 11.9137123,11.2545428 C11.822201,11.2881815 11.7261892,11.3050009 11.6331778,11.3050009 C11.3361414,11.3050009 11.0556069,11.1396103 10.9370924,10.8662954 C10.7825734,10.507482 10.9685963,10.099612 11.3526434,9.95384405 C12.2077483,9.63287422 12.7598161,8.86899406 12.7598161,8.00840246 C12.7598161,7.14921247 12.2077483,6.3853323 11.3526434,6.06436247 C10.9685963,5.91859451 10.7825734,5.51072455 10.9370924,5.1505095 C11.0931115,4.79309768 11.5341657,4.62210065 11.9137123,4.76366377 Z" />
      </SVGIconContainer>
    );
  }
}