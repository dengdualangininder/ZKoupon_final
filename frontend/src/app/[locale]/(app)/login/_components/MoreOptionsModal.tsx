import { useRouter } from "@/i18n/routing";
import Image from "next/image";
// wagmi
import { useConnect, useDisconnect } from "wagmi";
// types
import { MyConnector } from "@/utils/types";

export default function MoreOptionsModal({ setMoreOptionsModal, myConnectorsMore }: { setMoreOptionsModal: any; myConnectorsMore: MyConnector[] }) {
  let { connectAsync, connectors } = useConnect();
  const router = useRouter();

  return (
    <div className="">
      <div className="w-[340px] h-[360px] flex flex-col items-center justify-between px-6 py-10 bg-white rounded-xl border border-slate-500 fixed inset-1/2 -translate-y-[55%] -translate-x-1/2 z-[90]">
        {/*---title---*/}
        <div className="text-xl font-bold">Choose A Sign In Method</div>
        {/*---grid options---*/}
        <div className="w-full mt-8 grid grid-cols-3 gap-2">
          {myConnectorsMore.map((i) => (
            <div
              key={i.name}
              className="flex flex-col items-center"
              onClick={async () => {
                await connectAsync({ connector: connectors[i.connectorIndex] });
                router.push("/app");
              }}
            >
              <div className="relative w-[40px] h-[36px]">
                <Image src={i.img} alt={i.name} fill />
              </div>
              <div className="xs:text-xl">{i.name}</div>
            </div>
          ))}
        </div>
        {/*---close button---*/}
        <button
          onClick={() => setMoreOptionsModal(false)}
          className="mt-8 text-xl font-bold w-[160px] py-3 bg-white border border-slate-200 rounded-full tracking-wide drop-shadow-md"
        >
          CLOSE
        </button>
      </div>
      <div className="modalBlackout"></div>
    </div>
  );
}
