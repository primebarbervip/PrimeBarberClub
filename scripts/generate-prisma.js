import { execSync } from "child_process";

try {
  console.log("Running prisma generate...");
  const output = execSync("npx prisma generate", {
    cwd: "/vercel/share/v0-project",
    encoding: "utf-8",
    env: {
      ...process.env,
      DATABASE_URL: "postgresql://postgres.zjbldcwwiiwsrqfnvdgs:120950Samulx@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true",
      DIRECT_URL: "postgresql://postgres.zjbldcwwiiwsrqfnvdgs:120950Samulx@aws-1-us-east-1.pooler.supabase.com:5432/postgres",
    },
  });
  console.log(output);
  console.log("Prisma generate completed successfully!");
} catch (error) {
  console.error("Error:", error.message);
  if (error.stdout) console.log("stdout:", error.stdout);
  if (error.stderr) console.log("stderr:", error.stderr);
}
