import { workflow } from "@novu/framework";

workflow("sample-workflow", async (step) => {
  await step.onApp("welcome-step", async () => {
    return {
      subject: "Welcome to Novu",
      body: "Hello, welcome to Novu!",
    };
  });
});
