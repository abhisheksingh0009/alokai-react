// src/context/NavigationContext.tsx
import { createContext, useContext, useState } from 'react';

const NavigationContext = createContext<any>(null);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [selectCategoryByNav, setSelectCategoryByNav] = useState<string | null>(null);
  return (
    <NavigationContext.Provider value={{ selectCategoryByNav, setSelectCategoryByNav }}>
      {children}
    </NavigationContext.Provider>
  );
}

export const useNavigation = () => useContext(NavigationContext);