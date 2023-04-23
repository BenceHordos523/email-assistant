import { type AppType } from "next/app";

import { api } from "~/utils/api";
import { ClerkProvider } from "@clerk/nextjs";

import "~/styles/globals.css";
import { Navbar } from "../components/navbar";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider {...pageProps}>
      <Navbar />
      <Component {...pageProps} />;
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
