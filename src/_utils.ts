export async function fundMe(publicKey: string): Promise<any> {
  try {
    const response = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
    );
    const responseJSON = await response.json();
    return responseJSON;
  } catch (e) {
    console.error("[fund/error]!", e);
  }
}
