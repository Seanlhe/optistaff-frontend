import { FC, ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string;
  icon?: ReactNode;
}

const StatsCard: FC<StatsCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-white rounded-xl border border-border p-4 flex items-center">
      {icon && <div className="mr-4 text-primary-blue">{icon}</div>}
      <div>
        <p className="text-secondary-text text-sm font-bold">{title}</p>
        <p className="text-xl font-medium text-primary-blue">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;
