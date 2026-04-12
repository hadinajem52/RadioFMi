import React from 'react';
import { LanguageProvider } from '../contexts/LanguageContext';

const AppProviders = ({ children }) => {
  return <LanguageProvider>{children}</LanguageProvider>;
};

export default AppProviders;
