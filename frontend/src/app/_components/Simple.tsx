import Image from "next/image";

const Simple = () => {
  return (
    <div className="w-[77%] py-[100px] flex justify-between items-center">
      {/*--- text (left) ---*/}
      <div className="w-[540px]">
        {/*--- header ---*/}
        <div className="homepageHeaderFont">Simplicity means low overhead</div>
        {/*--- body ---*/}
        <div className="mt-8 w-[480px] homepageBodyFont space-y-6">
          <p>The Flash app was designed with simplicity in mind. With our minimalistic interface, you or your employees can easily confirm payments or make refunds.</p>
          <p>
            <span className="text-2xl">If you have a PoS system,</span> using Flash should not significantly increase your overhead. When a customer pays you through Flash, we recommend entering the transaction in your PoS system as a cash payment,
            so you have a record of the transaction within a single system. You or your employees would use the Flash app to simply confirm the payment.
          </p>
        </div>
      </div>
      {/*--- image (right) ---*/}
      <div className="relative w-[500px] h-[400px]">
        <Image src="/pos.jpg" alt="pointOfSale" fill style={{ objectFit: "contain" }} />
      </div>
    </div>
  );
};

export default Simple;
