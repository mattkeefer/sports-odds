import { useState } from "react";
import { Outlet, useOutletContext } from "react-router";
import { AuthPage } from "./pages/Auth";
import { UserModel } from "./models/user";

interface RootContextType {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  user: UserModel | null;
  setUser: (user: UserModel | null) => void;
}

export function Root() {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState<UserModel | null>(null);

  // If user is not logged in, show auth page
  if (!user) {
    return <AuthPage onLogin={setUser} />;
  }

  // Otherwise show the app
  return (
    <Outlet
      context={
        { darkMode, setDarkMode, user, setUser } satisfies RootContextType
      }
    />
  );
}

export function useDarkMode() {
  return useOutletContext<RootContextType>();
}

export function useUser() {
  return useOutletContext<RootContextType>();
}
