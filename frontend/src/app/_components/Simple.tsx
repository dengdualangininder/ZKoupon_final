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
      <div className="relative w-full h-[300px] sm:w-[500px] sm:h-[400px] xl:w-[47%] xl:h-[500px] xl:desktop:w-[440px] xl:desktop:h-[300px]">
        <Image src="/pos.jpg" alt="pointOfSale" fill style={{ objectFit: "contain" }} />
      </div>
    </div>
  );
};

export default Simple;
