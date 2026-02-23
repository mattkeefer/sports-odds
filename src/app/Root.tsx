import { useState } from "react";
import { Outlet, useOutletContext } from "react-router";
import { AuthPage, UserData } from "./pages/Auth";

interface RootContextType {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  user: UserData | null;
}

export function Root() {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);

  // If user is not logged in, show auth page
  if (!user) {
    return <AuthPage onLogin={setUser} />;
  }

  // Otherwise show the app
  return (
    <Outlet
      context={{ darkMode, setDarkMode, user } satisfies RootContextType}
    />
  );
}

export function useDarkMode() {
  return useOutletContext<RootContextType>();
}

export function useUser() {
  return useOutletContext<RootContextType>();
}
