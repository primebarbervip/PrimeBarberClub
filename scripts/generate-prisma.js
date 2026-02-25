// Use prisma's generate command programmatically  
process.env.DATABASE_URL = "postgresql://postgres.zjbldcwwiiwsrqfnvdgs:120950Samulx@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
process.env.DIRECT_URL = "postgresql://postgres.zjbldcwwiiwsrqfnvdgs:120950Samulx@aws-1-us-east-1.pooler.supabase.com:5432/postgres";

async function main() {
  console.log("Loading prisma internals...");
  try {
    const prismaModule = await import("/vercel/share/v0-next-shadcn/node_modules/prisma/build/index.js");
    console.log("Available exports:", Object.keys(prismaModule).slice(0, 20));
    
    // Try to use the CLI programmatically
    if (prismaModule.Generate) {
      const gen = new prismaModule.Generate();
      await gen.parse(["--schema=/vercel/share/v0-project/prisma/schema.prisma"]);
      console.log("Prisma client generated successfully!");
    } else if (prismaModule.CLI) {
      const cli = prismaModule.CLI.new({});
      await cli.parse(["generate", "--schema=/vercel/share/v0-project/prisma/schema.prisma"]);
      console.log("Prisma client generated successfully!");
    } else {
      console.log("Trying default export...");
      if (prismaModule.default) {
        console.log("Default export type:", typeof prismaModule.default);
        console.log("Default export keys:", Object.keys(prismaModule.default).slice(0, 20));
      }
    }
  } catch (err) {
    console.error("Error:", err.message);
    console.error("Stack:", err.stack);
  }
}

main();
