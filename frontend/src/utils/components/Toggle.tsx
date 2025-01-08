export default function Toggle({ checked, onClick }: { checked: boolean | undefined; onClick?: any }) {
  return (
    <div className="w-[56px] h-[30px] desktop:w-[46px] desktop:h-[25px] flex items-center relative cursor-pointer" onClick={onClick}>
      <input readOnly={true} type="checkbox" checked={checked} className="sr-only peer" />
      <div className="w-full h-full bg-slate-300 dark:bg-slate-600 peer-checked:bg-blue-500 dark:peer-checked:bg-darkButton rounded-full"></div>
      <div className="w-[25px] h-[25px] desktop:w-[21px] desktop:h-[21px] absolute left-[3px] desktop:left-[2px] peer-checked:translate-x-full rounded-full bg-light1 dark:bg-darkText1 transition-all pointer-events-none"></div>
    </div>
  );
}
