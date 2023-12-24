import fs from 'fs'
import { NFTStorage, File } from 'nft.storage'

const endpoint = 'https://api.nft.storage' // the default
// const token = 'API_KEY' // your API key from https://nft.storage/manage
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDliODc4YzZEMEQ1NDU4MDBjQzMzRjA2NTRCZGNFYTU5QjY3MURmOUMiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTcwMzQzOTcyMzI2NCwibmFtZSI6InVwbG9hZDEifQ.OeT2fdEaU4s3XV_v0IM1bJcX-HqDs20J3fDz8ipahhw' // your API key from https://nft.storage/manage

async function main() {
  const storage = new NFTStorage({ endpoint, token })
  const cid = await storage.storeDirectory([
    new File([await fs.promises.readFile('pinpie.jpg')], 'pinpie.jpg'),
    new File([await fs.promises.readFile('seamonster.jpg')], 'seamonster.jpg'),
  ])
  console.log({ cid })
  const status = await storage.status(cid)
  console.log(status)
}
main()
