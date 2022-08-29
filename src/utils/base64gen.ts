import QRCode from 'qrcode';

export default async function generateQR(text:string) {
  try {
    return (await QRCode.toDataURL(text))
  } catch (err) {

    console.error(err)
  }
}

