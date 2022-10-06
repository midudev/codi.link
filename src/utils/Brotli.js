// import { compress, decompress } from 'wasm-brotli/wasm_brotli_browser'
import BROTLi from 'brotli-wasm'
const brotli = await BROTLi
/**
 * It takes a string, splits it into an array, converts it into an array buffer, decompresses it, and
 * decodes it.
 * @param input - The input string to be decompressed.
 * @returns A function that takes a string and returns a promise that resolves to a string.
 */
export const BrotliDecompressor = async (input) => {
  const SplittedInput = input.split(',')
  const ArrayBufferFromInput = Uint8Array.from(SplittedInput)
  try {
    const DecompressedInput = brotli.decompress(ArrayBufferFromInput)
    const DecodedResult = new TextDecoder('utf-8').decode(DecompressedInput)
    return DecodedResult
  } catch (error) {
    console.error(error)
  }
}
/**
 * This function takes a string as input, converts it to an ArrayBuffer, and then compresses it using
 * the Brotli compression algorithm.
 * @param input - The string you want to compress.
 * @returns An ArrayBuffer
 */
export const BrotliCompressor = async (input) => {
  const ArrayBufferFromInput = new TextEncoder('utf-8').encode(input)
  try {
    const compressed = brotli.compress(ArrayBufferFromInput)
    return compressed
  } catch (error) {
    console.error(error)
  }
}
