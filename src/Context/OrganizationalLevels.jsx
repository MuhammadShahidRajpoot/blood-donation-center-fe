import React from 'react';

export const OrganizationalLevelsContext = React.createContext({});

export const OrganizationalLevelsProvider = ({ children }) => {
  const [data, setData] = React.useState({});

  React.useEffect(() => {
    setData(getLocalStorage());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getLocalStorage = (name = '') => {
    const storedData = localStorage.getItem('organizational_levels');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      return name ? parsedData[name] || {} : parsedData;
    }
    return {};
  };

  const setLocalStorage = (name, newData) => {
    if (!name) return;
    const parsedData = getLocalStorage();
    parsedData[name] = { ...parsedData[name], ...newData };
    localStorage.setItem('organizational_levels', JSON.stringify(parsedData));
    setData(parsedData);
  };

  const clearLocalStorage = (name) => {
    if (!name) return;
    const parsedData = getLocalStorage();
    parsedData[name] = {};
    localStorage.setItem('organizational_levels', JSON.stringify(parsedData));
    setData(parsedData);
  };

  return (
    <OrganizationalLevelsContext.Provider
      value={{
        data,
        OLData: getLocalStorage(),
        setOLData: setLocalStorage,
        getOLData: getLocalStorage,
        clearOLData: clearLocalStorage,
      }}
    >
      {children}
    </OrganizationalLevelsContext.Provider>
  );
};
