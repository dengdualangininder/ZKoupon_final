const EmployeePassModal = ({ setEmployeePassModal }: { setEmployeePassModal: any }) => {
  return (
    <div>
      <div className="modal">
        {/*---content---*/}
        <div className="grow flex flex-col justify-center">Do you want to change the Employee Password?</div>
        {/*---buttons---*/}
        <div className="w-full space-y-6">
          <button
            onClick={() => {
              document.getElementById("employeePassMask")?.classList.add("hidden");
              (document.getElementById("employeePass") as HTMLInputElement).value = "";
              document.getElementById("employeePass")?.focus();
              setEmployeePassModal(false);
            }}
            className="modalButtonBlue"
          >
            Confirm
          </button>
          <button onClick={() => setEmployeePassModal(false)} className="modalButtonWhite">
            Cancel
          </button>
        </div>
      </div>
      <div className="modalBlackout"></div>
    </div>
  );
};

export default EmployeePassModal;
