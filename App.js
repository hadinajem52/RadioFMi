import React from 'react';
import { AppProviders, AppScreen } from './app/index';

const App = () => {
  return (
    <AppProviders>
      <AppScreen />
    </AppProviders>
  );
};

export default App;
