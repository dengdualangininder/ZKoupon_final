"use client";
// wagmi
import { wagmiAdapter, projectId } from "@/config/wagmiConfig";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";
import { createAppKit } from "@reown/appkit/react";
import { arbitrum, polygon, optimism, base } from "@reown/appkit/networks";
// react query
import { isServer, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
//redux
import { Provider } from "react-redux";
import { store } from "@/state/store";

// Set up queryClient
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // With SSR, we usually want to set some default staleTime above 0 to avoid refetching immediately on the client
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  const date = new Date();
  const time = date.toLocaleTimeString("en-US", { hour12: false }) + `.${date.getMilliseconds()}`;
  if (isServer) {
    console.log("server queryClient created", time);
    return makeQueryClient(); // Server: always make a new query client
  } else {
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient(); // Browser: make a new query client if we don't already have one. This is very important, so we don't re-make a new client if React suspends during the initial render. This may not be needed if we have a suspense boundary BELOW the creation of the query client
      console.log("browser queryClient created");
    } else {
      console.log("browser queryClient already exists");
    }
    return browserQueryClient;
  }
}

// reown
export const metadata = {
  name: "DiversiFi",
  description: "Earn diversified yield (test app)",
  url: "https://diversifi.vercel.app",
  icons: ["/icon-svg.svg"],
};

if (!projectId) throw new Error("Project ID is not defined");

// Create the modal
const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [arbitrum, polygon, optimism, base],
  defaultNetwork: polygon,
  metadata: metadata,
  features: {
    // analytics: true, // Optional - defaults to your Cloud configuration
    email: false, // default to true
    socials: ["google", "apple"],
    emailShowWallets: true, // default to true
  },
  themeMode: "light",
});

export default function Providers({ children, cookies }: { children: React.ReactNode; cookies: string | null }) {
  const date = new Date();
  const time = date.toLocaleTimeString("en-US", { hour12: false }) + `.${date.getMilliseconds()}`;
  console.log("Providers.tsx", time);

  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies);
  const queryClient = getQueryClient();

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          {children}
          {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        </Provider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
