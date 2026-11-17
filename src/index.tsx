import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import SessionGate from "./components/SessionGate/SessionGate";
import { store } from "./app/store";
import { Provider } from "react-redux";
import { ApolloProvider } from "@apollo/client";
import apolloClient from "./app/apolloClient";
import { BrowserRouter } from "react-router-dom";

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

createRoot(container).render(
  <React.StrictMode>
    <Provider store={store}>
      <ApolloProvider client={apolloClient}>
        <SessionGate>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <App />
        </BrowserRouter>
        </SessionGate>
      </ApolloProvider>
    </Provider>
  </React.StrictMode>
);
