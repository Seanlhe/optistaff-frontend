import { useEffect, useState } from 'react';
import { DollarSign } from 'lucide-react';
import { usePayouts } from '../hooks/usePayouts';
import StatsCard from './StatsCard';

interface PayoutSummaryCardProps {
  refreshTrigger?: number; // Timestamp or counter to trigger refresh
}

const PayoutTotalSummaryCard = ({ refreshTrigger }: PayoutSummaryCardProps) => {
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const { 
    totalEarnings, 
    loading, 
    error,
    fetchTotalEarnings 
  } = usePayouts();

  // Function to fetch earnings data
  const fetchEarnings = async () => {
    setRefreshError(null);
    try {
      await fetchTotalEarnings();
    } catch (error) {
      setRefreshError('Failed to load total earnings');
    }
  };

  // Reactive refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger) {
      fetchEarnings();
    }
  }, [refreshTrigger]);

  // Prepare display value with safety checks
  const displayValue = loading 
    ? "Loading..." 
    : `$${(typeof totalEarnings === 'number' && !isNaN(totalEarnings) ? totalEarnings : 0).toFixed(2)}`;

  // Show error from usePayouts hook or local refresh error
  const displayError = error || refreshError;

  return (
    <div>
      <StatsCard
        title="Total Earnings"
        value={displayValue}
        icon={<DollarSign />}
      />
      
      {displayError && (
        <div className="text-xs text-red-500 mt-1 px-2">{displayError}</div>
      )}
    </div>
  );
};

export default PayoutTotalSummaryCard;