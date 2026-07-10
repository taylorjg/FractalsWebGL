const CHANGE_REGION_INTERVAL_SECONDS = 10;

export const doIdleTasks = (ctx) => {
  if (!ctx.nextConfiguration) {
    ctx.nextConfiguration = ctx.configurationChooser.chooseConfiguration(
      CHANGE_REGION_INTERVAL_SECONDS
    );
    ctx.nextConfigurationCount++;
  }
};
