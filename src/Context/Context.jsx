import React, { createContext, useState } from 'react';
export const GlobalContext = createContext({});

const Context = ({ children }) => {
  const [state, setState] = useState({
    isLocationChanged: false,
    callControlPopup: false,
    isAppointment: false,
  });
  return (
    <GlobalContext.Provider
      value={{
        isLocationChanged: state.isLocationChanged,
        handleLocationClick: (data) =>
          setState({ ...state, isLocationChanged: data }),
        callControlPopup: state.callControlPopup,
        setCallControlPopup: (value) =>
          setState({ ...state, callControlPopup: value }),
        isAppointment: state.isAppointment,
        isAppointmentCreated: (data) =>
          setState({ ...state, isAppointment: data }),
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default Context;
