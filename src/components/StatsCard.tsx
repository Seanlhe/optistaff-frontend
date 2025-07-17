import { FC, ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string;
  icon?: ReactNode;
}

const StatsCard: FC<StatsCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-white rounded-xl p-4 shadow flex items-center">
      {icon && <div className="mr-4 text-blue-600">{icon}</div>}
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold text-blue-600">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;
