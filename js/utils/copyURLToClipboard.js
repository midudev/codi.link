import shortURL from "./shortURL";

export default async function copyURLToClipboard() {
  try {
    const link = await shortURL(document.URL);

    // if is local url, api doesn't work
    if (link.code === "InvalidFormat")
      await navigator.clipboard.writeText(document.URL);
    else await navigator.clipboard.writeText(link.shortUrl);
  } catch (error) {
    console.log(error);
  }
}
