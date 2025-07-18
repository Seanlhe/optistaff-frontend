import { useState } from 'react';
import { DollarSign } from 'lucide-react';
import { usePayouts } from '../hooks/usePayouts';
import StatsCard from './StatsCard';

interface PayoutSummaryCardProps {
  timeframe?: 'week' | 'total'; 
}

const PayoutSummaryCard = ({ timeframe: defaultTimeframe = 'week' }: PayoutSummaryCardProps) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'total'>(defaultTimeframe);
  const { loading, error, payouts } = usePayouts();
  
  const getFilteredEarnings = () => {
    if (selectedTimeframe === 'total') return payouts.reduce((sum, p) => sum + p.amount, 0);
    
    // Get start of current week (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // If Sunday, go back 6 days to Monday
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0); // Start of Monday
    
    return payouts
      .filter(payout => new Date(payout.created_at) >= monday)
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const earnings = getFilteredEarnings();
  const title = selectedTimeframe === 'week' ? 'Earnings This Week' : 'Total Earnings';

  const handleToggle = () => {
    setSelectedTimeframe(selectedTimeframe === 'week' ? 'total' : 'week');
  };  return (
    <div onClick={handleToggle} style={{ cursor: 'pointer' }}>
      <StatsCard
        title={title}
        value={loading ? "Loading..." : error ? "Error" : `${earnings.toFixed(2)}`}
        icon={<DollarSign />}
      />
    </div>
  );
};

export default PayoutSummaryCard;