import { useEffect, useState } from 'react';
import { DollarSign, RotateCcw } from 'lucide-react';
import { usePayouts } from '../hooks/usePayouts';
import StatsCard from './StatsCard';

interface PayoutSummaryCardProps {
  refreshTrigger?: number; // Timestamp or counter to trigger refresh
  onRefresh?: () => void;   // Optional callback for manual refresh
}

const PayoutSummaryCard = ({ refreshTrigger, onRefresh }: PayoutSummaryCardProps) => {
  const [weeklyEarnings, setWeeklyEarnings] = useState<number>(0);
  const [weeklyLoading, setWeeklyLoading] = useState<boolean>(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const { getEstimatedWeeklyPay } = usePayouts();

  // Function to fetch earnings data
  const fetchEarnings = async () => {
    setWeeklyLoading(true);
    setRefreshError(null);
    try {
      const earnings = await getEstimatedWeeklyPay();
      setWeeklyEarnings(earnings);
    } catch (error) {
      setWeeklyEarnings(0);
      setRefreshError('Failed to load earnings');
    } finally {
      setWeeklyLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchEarnings();
  }, [getEstimatedWeeklyPay]);

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
    : `$${(typeof weeklyEarnings === 'number' && !isNaN(weeklyEarnings) ? weeklyEarnings : 0).toFixed(2)}`;

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
        <RotateCcw className={`w-4 h-4 ${weeklyLoading ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );

  return (
    <div>
      <StatsCard
        title="Weekly Earnings"
        value={displayValue}
        icon={iconWithRefresh}
      />
      
      {refreshError && (
        <div className="text-xs text-red-500 mt-1 px-2">{refreshError}</div>
      )}
    </div>
  );
};

export default PayoutSummaryCard;