import { ArrowLeft, Check, Crown } from "lucide-react";
import { useNavigate } from "react-router";
import { useDarkMode, useUser } from "../Root";

export type Tier = "free" | "pro" | "elite";

export function SubscriptionPage() {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const { darkMode, setDarkMode } = useDarkMode();

  const tiers = [
    {
      id: "free" as Tier,
      name: "Free",
      price: "$0",
      period: "/mo",
      description: "Get started with basic betting insights",
      features: [
        "Access to 5 events per day",
        "Basic EV calculations",
        "Single sportsbook filtering",
        "Standard refresh rate (15 min)",
        "Email support",
      ],
      buttonText:
        user!.subscriptionTier === "free" ? "Current Plan" : "Downgrade",
      highlighted: false,
    },
    {
      id: "pro" as Tier,
      name: "Pro",
      price: "$5",
      period: "/mo",
      description: "Unlock advanced features for serious bettors",
      features: [
        "Unlimited events",
        "Advanced EV & Kelly Criterion",
        "Multi-sportsbook comparison",
        "Fast refresh rate (5 min)",
        "Pinny mode (sharp line comparison)",
        "Historical bet tracking",
        "Priority email support",
        "Mobile app access",
      ],
      buttonText:
        user!.subscriptionTier === "pro"
          ? "Current Plan"
          : user!.subscriptionTier === "elite"
            ? "Downgrade to Pro"
            : "Upgrade to Pro",
      highlighted: user!.subscriptionTier === "free",
    },
    {
      id: "elite" as Tier,
      name: "Elite",
      price: "$20",
      period: "/mo",
      description: "Professional-grade tools for maximum edge",
      features: [
        "Everything in Pro, plus:",
        "Real-time odds updates",
        "Custom bankroll strategies",
        "API access for automation",
        "Advanced analytics dashboard",
        "Steam moves & line movement alerts",
        "Arbitrage opportunity detection",
        "Closing line value (CLV) tracking",
        "Priority phone & chat support",
        "Custom reports & exports",
      ],
      buttonText:
        user!.subscriptionTier === "elite"
          ? "Current Plan"
          : "Upgrade to Elite",
      highlighted: user!.subscriptionTier === "pro",
    },
  ];

  const handleSubscribe = (tierId: Tier) => {
    if (tierId === user?.subscriptionTier) return;

    // In a real app, this would handle payment/subscription
    alert(`Subscribing to ${tierId} plan...`);
    setUser({ ...user!, subscriptionTier: tierId as Tier });
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/")}
            className={`flex items-center gap-2 mb-4 px-3 py-2 rounded-lg transition-colors ${
              darkMode
                ? "text-gray-300 hover:text-white hover:bg-gray-800"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-3 mb-2">
            <Crown
              className={`w-8 h-8 ${darkMode ? "text-yellow-400" : "text-yellow-600"}`}
            />
            <h1
              className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              Subscription Plans
            </h1>
          </div>
          <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
            Choose the plan that fits your betting strategy
          </p>
        </div>

        {/* Current Tier Badge */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg mb-6 ${
            user!.subscriptionTier === "free"
              ? darkMode
                ? "bg-gray-800 border border-gray-700"
                : "bg-gray-200 border border-gray-300"
              : user!.subscriptionTier === "pro"
                ? "bg-gradient-to-r from-blue-600 to-blue-700 border border-blue-500"
                : "bg-gradient-to-r from-yellow-600 to-yellow-700 border border-yellow-500"
          }`}
        >
          <Crown
            className={`w-4 h-4 ${
              user!.subscriptionTier === "free"
                ? darkMode
                  ? "text-gray-400"
                  : "text-gray-600"
                : "text-white"
            }`}
          />
          <span
            className={`text-sm font-medium ${
              user!.subscriptionTier === "free"
                ? darkMode
                  ? "text-gray-300"
                  : "text-gray-700"
                : "text-white"
            }`}
          >
            Current Plan:{" "}
            {tiers.find((t) => t.id === user!.subscriptionTier)?.name}
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative border rounded-xl overflow-hidden transition-all ${
                tier.highlighted
                  ? tier.id === "pro"
                    ? darkMode
                      ? "border-blue-500 shadow-lg shadow-blue-500/20 scale-105"
                      : "border-blue-500 shadow-lg shadow-blue-500/20 scale-105"
                    : darkMode
                      ? "border-yellow-500 shadow-lg shadow-yellow-500/20 scale-105"
                      : "border-yellow-500 shadow-lg shadow-yellow-500/20 scale-105"
                  : darkMode
                    ? "border-gray-700 hover:border-gray-600"
                    : "border-gray-300 hover:border-gray-400"
              } ${darkMode ? "bg-gray-800" : "bg-white"}`}
            >
              {/* Popular Badge */}
              {tier.highlighted && (
                <div
                  className={`absolute top-0 right-0 ${tier.id === "pro" ? "bg-blue-500" : "bg-yellow-500"} text-white text-xs font-bold px-3 py-1 rounded-bl-lg`}
                >
                  {tier.id === "pro" ? "POPULAR" : "BEST VALUE"}
                </div>
              )}

              {/* Current Plan Badge */}
              {user!.subscriptionTier === tier.id && (
                <div
                  className={`absolute top-0 left-0 text-xs font-bold px-3 py-1 rounded-br-lg ${
                    tier.highlighted
                      ? "bg-green-500 text-white"
                      : darkMode
                        ? "bg-green-700 text-white"
                        : "bg-green-600 text-white"
                  }`}
                >
                  ACTIVE
                </div>
              )}

              <div className="p-6">
                {/* Tier Name */}
                <h3
                  className={`text-2xl font-bold mb-2 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {tier.name}
                </h3>

                {/* Price */}
                <div className="mb-4">
                  <span
                    className={`text-4xl font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {tier.price}
                  </span>
                  <span
                    className={darkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    {tier.period}
                  </span>
                </div>

                {/* Description */}
                <p
                  className={`text-sm mb-6 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {tier.description}
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          tier.highlighted
                            ? tier.id === "pro"
                              ? "text-blue-500"
                              : "text-yellow-500"
                            : darkMode
                              ? "text-green-500"
                              : "text-green-600"
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handleSubscribe(tier.id)}
                  disabled={user!.subscriptionTier === tier.id}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    user!.subscriptionTier === tier.id
                      ? darkMode
                        ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : tier.highlighted
                        ? tier.id === "pro"
                          ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                          : "bg-yellow-500 text-white hover:bg-yellow-600 shadow-md hover:shadow-lg"
                        : darkMode
                          ? "bg-gray-700 text-white hover:bg-gray-600"
                          : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                >
                  {tier.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div
          className={`mt-8 p-6 rounded-lg border ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <h3
            className={`text-lg font-semibold mb-3 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            <div>
              <h4
                className={`font-medium mb-1 ${
                  darkMode ? "text-gray-200" : "text-gray-800"
                }`}
              >
                Can I cancel anytime?
              </h4>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Yes, you can cancel your subscription at any time. You'll retain
                access until the end of your billing period.
              </p>
            </div>
            <div>
              <h4
                className={`font-medium mb-1 ${
                  darkMode ? "text-gray-200" : "text-gray-800"
                }`}
              >
                What payment methods do you accept?
              </h4>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                We accept all major credit cards, PayPal, and cryptocurrency.
              </p>
            </div>
            <div>
              <h4
                className={`font-medium mb-1 ${
                  darkMode ? "text-gray-200" : "text-gray-800"
                }`}
              >
                Is there a free trial?
              </h4>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                The Free tier is always available. Pro and Elite plans come with
                a 7-day money-back guarantee.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
