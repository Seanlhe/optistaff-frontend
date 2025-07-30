import { useEffect, useState } from 'react';
import { DollarSign } from 'lucide-react';
import { useAssignments } from '../hooks/useAssignments';
import StatsCard from './StatsCard';

interface PayoutSummaryCardProps {
  refreshTrigger?: number; // Timestamp or counter to trigger refresh
}

const PayoutWeeklySummaryCard = ({ refreshTrigger }: PayoutSummaryCardProps) => {
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const { 
    weeklyTotal, 
    loading: weeklyLoading, 
    error,
    fetchWeeklyEarnings 
  } = useAssignments();

  // Function to fetch earnings data
  const fetchEarnings = async () => {
    setRefreshError(null);
    try {
      await fetchWeeklyEarnings();
    } catch (error) {
      setRefreshError('Failed to load earnings');
    }
  };

  // Reactive refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger) {
      fetchEarnings();
    }
  }, [refreshTrigger]);

  // Prepare display value with safety checks
  const displayValue = weeklyLoading 
    ? "Loading..." 
    : `$${(typeof weeklyTotal === 'number' && !isNaN(weeklyTotal) ? weeklyTotal : 0).toFixed(2)}`;

  // Show error from useAssignments hook or local refresh error
  const displayError = error || refreshError;

  return (
    <div>
      <StatsCard
        title="Weekly Earnings"
        value={displayValue}
        icon={<DollarSign />}
      />
      
      {displayError && (
        <div className="text-xs text-red-500 mt-1 px-2">{displayError}</div>
      )}
    </div>
  );
};

export default PayoutWeeklySummaryCard;