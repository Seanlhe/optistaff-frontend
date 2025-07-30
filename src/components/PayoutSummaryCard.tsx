import { useEffect, useState } from "react";
import { DollarSign, RotateCcw } from "lucide-react";
import { useAssignments } from "../hooks/useAssignments";
import StatsCard from "./StatsCard";

interface PayoutSummaryCardProps {
  refreshTrigger?: number; // Timestamp or counter to trigger refresh
  onRefresh?: () => void; // Optional callback for manual refresh
}

const PayoutSummaryCard = ({
  refreshTrigger,
  onRefresh,
}: PayoutSummaryCardProps) => {
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const {
    weeklyTotal,
    loading: weeklyLoading,
    error,
    fetchWeeklyEarnings,
  } = useAssignments();

  // Function to fetch earnings data
  const fetchEarnings = async () => {
    setRefreshError(null);
    try {
      await fetchWeeklyEarnings();
    } catch (error) {
      setRefreshError("Failed to load earnings");
    }
  };

  // Reactive refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger) {
      fetchEarnings();
    }
  }, [refreshTrigger]);

  // Manual refresh handler
  const handleManualRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      fetchEarnings();
    }
  };

  // Prepare display value with safety checks
  const displayValue = weeklyLoading
    ? "Loading..."
    : `$${(typeof weeklyTotal === "number" && !isNaN(weeklyTotal) ? weeklyTotal : 0).toFixed(2)}`;

  // Custom icon with refresh button
  const iconWithRefresh = (
    <div className="flex items-center gap-2">
      <DollarSign />
      <button
        onClick={handleManualRefresh}
        disabled={weeklyLoading}
        className="p-1 text-secondary-text hover:text-primary-text transition-colors disabled:opacity-50"
        title="Refresh earnings"
      >
        <RotateCcw
          className={`w-4 h-4 ${weeklyLoading ? "animate-spin" : ""}`}
        />
      </button>
    </div>
  );

  // Show error from useAssignments hook or local refresh error
  const displayError = error || refreshError;

  return (
    <div>
      <StatsCard
        title="Weekly Earnings"
        value={displayValue}
        icon={iconWithRefresh}
      />

      {displayError && (
        <div className="text-xs text-red-500 mt-1 px-2">{displayError}</div>
      )}
    </div>
  );
};

export default PayoutSummaryCard;
