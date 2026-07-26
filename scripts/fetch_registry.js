async function run() {
  const res = await fetch("http://localhost:3000/api/agents/registry");
  const data = await res.json();
  console.log("Agents in DB:", JSON.stringify(data, null, 2));
}
run().catch(console.error);
