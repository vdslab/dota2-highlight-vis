export async function request(id) {
  const access_token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiJodHRwczovL3N0ZWFtY29tbXVuaXR5LmNvbS9vcGVuaWQvaWQvNzY1NjExOTgwNDA5NzYzMTYiLCJ1bmlxdWVfbmFtZSI6IkJsdWVrb29wYSIsIlN1YmplY3QiOiI5YmFlYzA5YS0wNTk4LTQyOWItOWI2ZS1kNTBkMjE0ZDllNTQiLCJTdGVhbUlkIjoiODA3MTA1ODgiLCJuYmYiOjE2NjAxOTA0MTcsImV4cCI6MTY5MTcyNjQxNywiaWF0IjoxNjYwMTkwNDE3LCJpc3MiOiJodHRwczovL2FwaS5zdHJhdHouY29tIn0.24rFe6QiDLahL6qP-uZvXUs-OEE2GbooWFJXZyOXRCE";
  const query =
    `
    {
      match(id:` +
    id +
    `) {
        winRates
        players{
          hero{
            name
          }
          stats{
            experiencePerMinute
            goldPerMinute
          }
        }
      }
    }
    `;

  const response = await fetch("https://api.stratz.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const responseData = await response.json();
  return responseData;
}