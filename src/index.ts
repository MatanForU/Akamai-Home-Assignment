import "dotenv/config";

const PORT = process.env.PORT ?? "3000";
const LOG_LEVEL = process.env.LOG_LEVEL ?? "info";

function log(message: string): void {
  if (LOG_LEVEL === "debug") {
    console.log(`[debug] ${message}`);
  }
}

function main(): void {
  log(`starting up with PORT=${PORT}, LOG_LEVEL=${LOG_LEVEL}`);
  console.log("Akamai Home Assignment app is running.");
}

main();
