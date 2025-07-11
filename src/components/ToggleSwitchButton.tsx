interface ToggleButtonProps {
  option1: string;
  option2: string;
  selected: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function ToggleSwitchButton({
  option1,
  option2,
  selected,
  onClick,
}: ToggleButtonProps) {
  return (
    <div className="relative w-fit flex flex-row rounded-4xl border-4 border-secondary-bg bg-white overflow-hidden">
      <span
        className={`
          absolute top-0 left-0 h-full w-1/2 
          bg-primary-blue 
          rounded-4xl 
          transition-transform duration-300
          z-0
          ${selected === option2 ? "translate-x-full" : ""}
        `}
      />

      <button
        onClick={onClick}
        className={`hover:cursor-pointer relative z-10 w-1/2 px-8 py-3 text-lg font-montserrat transition duration-200 rounded-4xl ${
          selected === option1 ? "text-white" : "text-black opacity-50"
        }`}
      >
        {option1}
      </button>

      <button
        onClick={onClick}
        className={`hover:cursor-pointer relative z-10 w-1/2 px-8 py-3 text-lg font-montserrat transition duration-200 rounded-4xl ${
          selected === option2 ? "text-white" : "text-black opacity-50"
        }`}
      >
        {option2}
      </button>
    </div>
  );
}
