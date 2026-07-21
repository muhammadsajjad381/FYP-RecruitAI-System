import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(
    localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : null
  );

  const login = (data) => {
    localStorage.setItem('userInfo', JSON.stringify(data));
    setUserInfo(data);
  };

  const updateUser = (data) => {
    // Merge new data with existing userInfo without dropping the token or other critical states (if necessary)
    const updatedData = { ...userInfo, ...data };
    localStorage.setItem('userInfo', JSON.stringify(updatedData));
    setUserInfo(updatedData);
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUserInfo(null);
  };

  return (
    <AuthContext.Provider value={{ userInfo, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
