async function main() {
  const res = await fetch("https://example.com");

  console.log(Object.fromEntries(res.headers));
}

main();
