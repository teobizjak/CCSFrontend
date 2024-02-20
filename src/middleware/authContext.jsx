import React, { createContext, useContext, useState } from 'react';

// Create a Context
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isTokenValid, setIsTokenValid] = useState(false);

  return (
    <AuthContext.Provider value={{ isTokenValid, setIsTokenValid }}>
      {children}
    </AuthContext.Provider>
  );
};
