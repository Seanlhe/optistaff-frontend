import { IconButtonProps } from "../types/components";

export default function IconButton({ text, src, onClick }: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      className="hover:opacity-70 hover:cursor-pointer bg-primary-blue font-montserrat flex flex-row justify-center items-center text-white text-base text-center px-4 py-4 gap-3 rounded-lg"
    >
      <img className="w-5 h-5" src={src}></img>
      {text}
    </button>
  );
}
