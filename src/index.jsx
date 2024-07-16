import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { ClerkProvider } from "@clerk/clerk-react";
import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "./theme";

const root = ReactDOM.createRoot(document.getElementById("root"));
console.log("AAAA");
console.log(import.meta.env.VITE_CLERK_PUB_KEY)
root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUB_KEY}>
      <ChakraProvider theme={theme}>
        <App />
      </ChakraProvider>
    </ClerkProvider>
  </React.StrictMode>
);
