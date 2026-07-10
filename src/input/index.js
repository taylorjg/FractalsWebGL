import { configureKeyboard } from "./keyboard";
import { configurePointer } from "./pointer";

export const configureInput = (
  ctx,
  { render, createBookmark, hideConfigurationSummary, showConfigurationSummary }
) => {
  const attachKeyboardListeners = configureKeyboard(ctx, {
    render,
    createBookmark,
    hideConfigurationSummary,
    showConfigurationSummary,
  });
  const attachPointerListeners = configurePointer(ctx, { render });

  return {
    attachInputListeners: () => {
      attachKeyboardListeners();
      attachPointerListeners();
    },
  };
};
