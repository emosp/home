export const base64ToArrayBuffer = (base64: string) => Uint8Array.from(atob(base64), (char) => char.charCodeAt(0))

export const DecodeApi = async (key_base64: string, data_encode: string): Promise<object> => {
  let name = 'AES-GCM'

  try {
    // openssl rand -base64 32
    let key = await crypto.subtle.importKey('raw', base64ToArrayBuffer(key_base64), { name }, false, ['decrypt'])

    let data_buffer = base64ToArrayBuffer(data_encode)

    let data_buffer_decode = await crypto.subtle.decrypt(
      {
        name,
        iv: data_buffer.slice(0, 12),
      },
      key,
      data_buffer.slice(12),
    )

    let data_string = new TextDecoder().decode(data_buffer_decode)

    return JSON.parse(data_string)
  } catch (e) {
    console.error(`DecodeApi error: ${e}`)
    return null
  }
}
