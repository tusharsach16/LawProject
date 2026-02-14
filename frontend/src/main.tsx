import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import App from "./App";
import { store, persistor } from "./redux/store";
import { ToastProvider } from "./components/useToast";

import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ToastProvider>
          <App />
        </ToastProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
);
