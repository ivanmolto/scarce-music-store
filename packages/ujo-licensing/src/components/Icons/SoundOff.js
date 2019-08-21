import React from 'react';

import SVGIconContainer from './SVGIconContainer';
import BasicSVG from './BasicSVG';

export default class SoundOff extends BasicSVG {
  render() {
    return (
      <SVGIconContainer {...this.props}>
        <path d="M7.2878502,1.1039338 C7.7936316,1.31354909 8.12225427,1.80715928 8.12225427,2.35351138 L8.12225427,13.1723649 C8.12225427,13.718717 7.7936316,14.2123272 7.2878502,14.4219425 C7.12015797,14.4909127 6.9443516,14.5247216 6.76989759,14.5247216 C6.41828485,14.5247216 6.07343389,14.3867812 5.81378141,14.1284811 L2.15295185,10.4676515 L1.35235669,10.4676515 C0.605855797,10.4676515 0,9.86179572 0,9.11529483 L0,6.41058145 C0,5.66408056 0.605855797,5.05822476 1.35235669,5.05822476 L2.15295185,5.05822476 L5.81378141,1.3973952 C6.20055542,1.00926883 6.78071644,0.892966159 7.2878502,1.1039338 Z M13.727367,7.67814538 L15.1622175,9.11299582 C15.425927,9.37670538 15.425927,9.80405009 15.1622175,10.069112 C15.0296865,10.2002906 14.8565849,10.2665561 14.6834832,10.2665561 C14.5103816,10.2665561 14.3372799,10.2002906 14.2061013,10.069112 L12.7712509,8.63426155 L11.3364004,10.069112 C11.2052218,10.2002906 11.0321202,10.2665561 10.8590185,10.2665561 C10.6859169,10.2665561 10.5128152,10.2002906 10.3802842,10.069112 C10.1165747,9.80405009 10.1165747,9.37670538 10.3802842,9.11299582 L11.8151347,7.67814538 L10.3802842,6.24329493 C10.1165747,5.97958537 10.1165747,5.55224066 10.3802842,5.28717875 C10.6453461,5.02346919 11.0726909,5.02346919 11.3364004,5.28717875 L12.7712509,6.7220292 L14.2061013,5.28717875 C14.4698109,5.02346919 14.8971556,5.02346919 15.1622175,5.28717875 C15.425927,5.55224066 15.425927,5.97958537 15.1622175,6.24329493 L13.727367,7.67814538 Z" />
      </SVGIconContainer>
    );
  }
}