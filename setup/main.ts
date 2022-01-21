import { defineAppSetup } from "@slidev/types";
import ProgressPlugin from "../src/index";

export default defineAppSetup(({ app }) => {
  app.use(ProgressPlugin);
});
