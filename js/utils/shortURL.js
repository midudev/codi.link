export default async function shortURL(long_url) {
  const link_request = {
    destination: long_url,

    // TODO: need to add code.link custom domain to API
    domain: { fullName: "rebrand.ly" },
  };

  try {
    const data = await fetch(`https://api.rebrandly.com/v1/links`, {
      method: "POST",
      body: JSON.stringify(link_request),
      headers: {
        "Content-Type": "application/json",
        apikey: import.meta.env.VITE_SHORTEN_LINK_API_KEY,
        workspace: import.meta.env.VITE_SHORTEN_LINK_WORKSPACE_ID,
      },
    }).then((res) => res.json());

    return data;
  } catch (error) {
    console.error(error);
  }
}
