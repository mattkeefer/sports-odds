import { useState, type Dispatch, type SetStateAction } from "react";
import { Outlet, useOutletContext } from "react-router";
import { AuthPage } from "./pages/Auth";
import { UserModel } from "./models/user";
import { getListOfLeagues, getListOfSportsbooks } from "./models/models";

interface DashboardConfig {
  pinnyMode: boolean;
  setPinnyMode: Dispatch<SetStateAction<boolean>>;
  bankroll: number;
  setBankroll: Dispatch<SetStateAction<number>>;
  selectedSportsbooks: string[];
  setSelectedSportsbooks: Dispatch<SetStateAction<string[]>>;
  oddsRange: [number, number];
  setOddsRange: Dispatch<SetStateAction<[number, number]>>;
  minEV: number;
  setMinEV: Dispatch<SetStateAction<number>>;
  selectedLeagues: string[];
  setSelectedLeagues: Dispatch<SetStateAction<string[]>>;
  dateRange: [string, string];
  setDateRange: Dispatch<SetStateAction<[string, string]>>;
  filtersExpanded: boolean;
  setFiltersExpanded: Dispatch<SetStateAction<boolean>>;
}

interface RootContextType {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  user: UserModel | null;
  setUser: (user: UserModel | null) => void;
  dashboardConfig: DashboardConfig;
}

export function Root() {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState<UserModel | null>(null);
  const [pinnyMode, setPinnyMode] = useState(true);
  const [bankroll, setBankroll] = useState(1000);
  const [selectedSportsbooks, setSelectedSportsbooks] = useState<string[]>(
    getListOfSportsbooks(),
  );
  const [oddsRange, setOddsRange] = useState<[number, number]>([-300, 200]);
  const [minEV, setMinEV] = useState(2.5);
  const [selectedLeagues, setSelectedLeagues] =
    useState<string[]>(getListOfLeagues());
  const [dateRange, setDateRange] = useState<[string, string]>(() => [
    new Date().toISOString().split("T")[0],
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  ]);
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  const dashboardConfig = {
    pinnyMode,
    setPinnyMode,
    bankroll,
    setBankroll,
    selectedSportsbooks,
    setSelectedSportsbooks,
    oddsRange,
    setOddsRange,
    minEV,
    setMinEV,
    selectedLeagues,
    setSelectedLeagues,
    dateRange,
    setDateRange,
    filtersExpanded,
    setFiltersExpanded,
  };

  // If user is not logged in, show auth page
  if (!user) {
    return <AuthPage onLogin={setUser} />;
  }

  // Otherwise show the app
  return (
    <Outlet
      context={
        {
          darkMode,
          setDarkMode,
          user,
          setUser,
          dashboardConfig,
        } satisfies RootContextType
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
