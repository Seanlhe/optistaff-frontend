import { Shift } from "../../types/hooks";
import { useState } from "react";
import { useShifts } from "../../hooks/useShifts";
import ClientEdit from "./ClientEdit";
import ClientDashboard from "./ClientDashboard";

export default function ClientDbContainer() {
  const { shifts } = useShifts();
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  const handleManageClick = (shift: Shift) => {
    setSelectedShift(shift);
  };

  const handleCloseEdit = () => {
    setSelectedShift(null);
  };

  return selectedShift ? (
    <ClientEdit shift={selectedShift} onClose={handleCloseEdit} />
  ) : (
    <ClientDashboard shifts={shifts} handleManageClick={handleManageClick} />
  );
}
