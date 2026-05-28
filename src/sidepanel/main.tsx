import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { useStore } from "../shared/store";
import { detectInitialLocale, initI18n } from "../shared/i18n";

async function bootstrap() {
  await useStore.getState().hydrate();
  const locale = detectInitialLocale(useStore.getState().settings.locale);
  if (locale !== useStore.getState().settings.locale) {
    useStore.getState().setLocale(locale);
  }
  await initI18n(locale);

  const rootEl = document.getElementById("root");
  if (!rootEl) return;
  createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

bootstrap();
