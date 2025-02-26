import { createTables } from "./database";

async function main() {
  const rs = await createTables();
  console.log(rs);
}

main();
