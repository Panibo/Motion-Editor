import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/").at(-1);
const pagesBasePath = repositoryName ? `/${repositoryName}/` : "/";

export default defineConfig({
  // GitHub project pages are served from /<repository>/ instead of the domain root.
  base: process.env.GITHUB_ACTIONS === "true" ? pagesBasePath : "/",
  plugins: [react()],
});
