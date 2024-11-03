export const compareAndSetCancel = (
  typeData,
  compareData,
  cancel,
  setCancel,
  hide = false
) => {
  console.log({ typeData }, { compareData }, typeData === compareData);
  // if (hide) {
  //   console.log('in hide');
  //   setCancel(false);
  // } else
  if (Object.keys(typeData)?.length && Object.keys(compareData)?.length) {
    if (JSON.stringify(typeData) !== JSON.stringify(compareData)) {
      console.log('coming in');
      setCancel(true);
    } else {
      setCancel(false);
    }
  } else {
    if (Object.keys(typeData) && Object.keys(compareData)) {
      if (JSON.stringify(typeData) !== JSON.stringify(compareData)) {
        console.log('coming in two');
        setCancel(true);
      } else {
        setCancel(false);
      }
    } else {
      setCancel(false);
    }
  }
};
