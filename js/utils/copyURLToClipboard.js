export default async function copyURLToClipboard() {
  try {
    await navigator.clipboard.writeText(document.URL);
  } catch (error) {
    console.log(error);
  }
}
