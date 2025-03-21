import { ImSpinner2 } from "react-icons/im";
export default function Spinner({ size }: { size?: number }) {
  return <ImSpinner2 className="animate-spin text-slate-300" style={{ fontSize: size ?? 28 }} />;
}
