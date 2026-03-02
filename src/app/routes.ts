import { createBrowserRouter } from "react-router";
import { Root } from "./Root";
import { DashboardPage } from "./pages/Dashboard";
import { SubscriptionPage } from "./pages/Subscription";
import { BetTrackingPage } from "./pages/BetTracking";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: DashboardPage },
      { path: "subscription", Component: SubscriptionPage },
      { path: "tracking", Component: BetTrackingPage },
    ],
  },
]);
