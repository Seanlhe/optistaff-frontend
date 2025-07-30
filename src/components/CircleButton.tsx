import { CircleButtonProps } from "../types/components";

export default function CircleButton({ className, src }: CircleButtonProps) {
  return (
    <button className="hover:opacity-70 hover:cursor-pointer bg-white w-15 h-15 rounded-full justify-items-center ">
      <img src={src}></img>
    </button>
  );
}
