import { DateRange } from "react-day-picker";
export type Rates = { usdcToLocal: number; usdToLocal: number };
export type NullaInfo = { userType: string; userJwt: string };
export type W3Info = { idToken: string; publicKey: string; email?: string };
export type MyConnector = { name: string; img: string; connectorIndex: number };
type OrientationLockType = "any" | "landscape" | "landscape-primary" | "landscape-secondary" | "natural" | "portrait" | "portrait-primary" | "portrait-secondary";
interface ScreenOrientation extends EventTarget {
  lock(orientation: OrientationLockType): Promise<void>;
}
export type Filter = { last4Chars?: string; toRefund?: boolean; refunded?: boolean; searchDate?: DateRange };
export type ModalState = { render: boolean; show: boolean };
export type RateKey = "usdToEur" | "usdcToEur" | "usdToGbp" | "usdcToGbp" | "usdToTwd" | "usdcToTwd";
export type AllRates = Record<string, { usdToLocal: number; usdcToLocal: number }>;
