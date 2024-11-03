import React from 'react';
import { removeCountyWord } from '../../../helpers/utils';

export default function ViewPhysicalAddress({ address }) {
  return (
    <>
      {address?.address1} {address?.address2}
      <br />
      {removeCountyWord(address?.city)}, {address?.state} {address?.zip_code}
    </>
  );
}
