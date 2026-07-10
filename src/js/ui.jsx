import { createRoot } from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { UiController } from "../components/ui-controller";
import { fractalsTheme } from "../theme";

let uiActions = null;
const pendingCalls = [];

const invokeAction = (method, ...args) => {
  if (uiActions) {
    uiActions[method](...args);
    return;
  }
  pendingCalls.push([method, args]);
};

const registerActions = (actions) => {
  uiActions = actions;
  pendingCalls.splice(0).forEach(([method, args]) => actions[method](...args));
};

export const configureUI = (deps) => {
  const container = document.getElementById("ui-root");
  const root = createRoot(container);

  root.render(
    <ThemeProvider theme={fractalsTheme}>
      <CssBaseline />
      <UiController {...deps} registerActions={registerActions} />
    </ThemeProvider>
  );

  return {
    presentBookmarkModal: (bookmark) => invokeAction("presentBookmarkModal", bookmark),
    presentManageBookmarksModal: (bookmarks) =>
      invokeAction("presentManageBookmarksModal", bookmarks),
  };
};
