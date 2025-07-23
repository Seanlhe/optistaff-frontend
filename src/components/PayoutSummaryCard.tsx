import { useEffect, useState } from 'react';
import { DollarSign } from 'lucide-react';
import { usePayouts } from '../hooks/usePayouts';
import StatsCard from './StatsCard';

const PayoutSummaryCard = () => {
  const [weeklyEarnings, setWeeklyEarnings] = useState<number>(0);
  const [weeklyLoading, setWeeklyLoading] = useState<boolean>(false);
  const { getEstimatedWeeklyPay } = usePayouts();

  // Fetch estimated weekly pay
  useEffect(() => {
    setWeeklyLoading(true);
    getEstimatedWeeklyPay()
      .then((amount) => {
        setWeeklyEarnings(amount);
        setWeeklyLoading(false);
      })
      .catch(() => {
        setWeeklyEarnings(0);
        setWeeklyLoading(false);
      });
  }, [getEstimatedWeeklyPay]);

  return (
    <StatsCard
      title="Estimated Earning"
      value={weeklyLoading ? "Loading..." : `${weeklyEarnings.toFixed(2)}`}
      icon={<DollarSign />}
    />
  );
};

export default PayoutSummaryCard;