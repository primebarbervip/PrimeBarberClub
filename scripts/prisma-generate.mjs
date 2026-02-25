import { execSync } from "child_process";

try {
  console.log("Running prisma generate...");
  const output = execSync("npx prisma generate", { encoding: "utf-8", cwd: "/vercel/share/v0-project" });
  console.log(output);
  console.log("Prisma generate completed successfully.");
} catch (error) {
  console.error("Error running prisma generate:", error.message);
  if (error.stdout) console.log("stdout:", error.stdout);
  if (error.stderr) console.log("stderr:", error.stderr);
}
