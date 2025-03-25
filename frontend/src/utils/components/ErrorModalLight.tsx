// import { useTranslations } from "next-intl";

// export default function ErrorModalLight({ errorModal, setErrorModal }: { errorModal: React.ReactNode | null; setErrorModal: any }) {
//   const tcommon = useTranslations("Common");

//   return (
//     <div className="z-200">
//       <div className="errorModal font-normal">
//         {/*--- content ---*/}
//         <div className="modalXpaddingLg overflow-y-auto">
//           {/*---text---*/}
//           <div className="errorModalFont py-[16px]">{errorModal}</div>
//           {/*--- button ---*/}
//           <div className="modalButtonContainer">
//             <button onClick={() => setErrorModal(null)} className="appButton1Light sm:max-w-[300px]">
//               {tcommon("close")}
//             </button>
//           </div>
//         </div>
//       </div>
//       <div className="modalBlackout"></div>
//     </div>
//   );
// }
