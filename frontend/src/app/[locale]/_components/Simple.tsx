import Image from "next/image";

const Simple = () => {
  return (
    <div className="homeSectionSize flex flex-col items-center xl:flex-row xl:items-center xl:justify-between">
      {/*--- text (left) ---*/}
      <div className="w-full xl:w-[47%]">
        {/*--- header ---*/}
        <div className="homeHeaderFont">
          Simplicity means
          <br />
          low overhead
        </div>
        {/*--- body ---*/}
        <div className="homeBodyFont mt-8 w-full xl:w-[480px] space-y-6">
          <p>The Flash app was designed with simplicity in mind. With our minimalistic interface, you or your employees can easily confirm payments or make refunds.</p>
          <p>
            <span className="text-2xl">If you have a PoS system,</span> using Flash should not significantly increase your overhead. When a customer pays you through Flash, we
            recommend entering the transaction in your PoS system as a cash payment, so you have a record of the transaction within a single system. You or your employees would use
            the Flash app to simply confirm the payment.
          </p>
        </div>
      </div>
      {/*--- image (right) ---*/}
      <div className="mt-10 relative w-[356px] h-[calc(356px/1.5)] sm:w-[500px] sm:h-[calc(500px/1.5)] xl:desktop:w-[480px] xl:desktop:h-[calc(480px/1.5)] rounded-3xl overflow-hidden">
        <Image src="/pos.jpg" alt="pointOfSale" fill />
      </div>
    </div>
  );
};

export default Simple;
