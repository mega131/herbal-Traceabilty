import React from 'react';
// shim to satisfy imports that might reference AuthProvider
export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return <>{children}</>;
};


