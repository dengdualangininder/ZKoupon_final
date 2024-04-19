const EmployeePassModal = ({ setEmployeePassModal }: { setEmployeePassModal: any }) => {
  return (
    <div>
      <div className="w-[330px] min-h-[300px] px-8 flex flex-col items-center bg-white rounded-xl border border-gray-500 fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-55%] z-[90]">
        {/*---content---*/}
        <div className="py-12 grow flex flex-col justify-center text-xl md:text-base text-center">Do you want to change the Employee Password?</div>
        {/*---content---*/}
        <button
          onClick={() => {
            document.getElementById("employeePassMask")?.classList.add("hidden");
            setEmployeePassModal(false);
            (document.getElementById("employeePass") as HTMLInputElement).value = "";
            document.getElementById("employeePass")?.focus();
          }}
          className="w-[250px] py-2.5 text-white text-lg font-bold tracking-wide bg-blue-500 lg:hover:opacity-60 active:opacity-60 rounded-md border border-blue-500 drop-shadow-md"
        >
          Confirm
        </button>
        <button
          onClick={() => setEmployeePassModal(false)}
          className="mt-8 mb-12 w-[250px] py-2.5 text-gray-500 text-lg font-bold tracking-wide bg-white lg:hover:opacity-60 active:opacity-60 rounded-md border border-gray-500 drop-shadow-md"
        >
          Cancel
        </button>
      </div>
      <div className="modalBlackout"></div>
    </div>
  );
};

export default EmployeePassModal;
