import { useState } from 'react';

let sharedData = {};

export const useSharedData = () => {
  const [data, setData] = useState(sharedData);

  const setSharedData = (newData) => {
    sharedData = { ...sharedData, ...newData };
    setData(sharedData);
  };

  return { data, setSharedData };
};
