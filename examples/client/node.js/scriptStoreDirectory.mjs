import { NFTStorage } from 'nft.storage'
import { filesFromPaths } from 'files-from-path'
import path from 'path'
import 'dotenv/config'

const token = process.env.NFTSTORAGE_API_KEY;

async function main() {
  // you'll probably want more sophisticated argument parsing in a real app
  console.log(process.argv);
  if (process.argv.length !== 3) {
    console.error(`usage: ${process.argv[0]} ${process.argv[1]} <directory-path>`)
    process.exit();
  }
  const directoryPath = process.argv[2]
  const files = await filesFromPaths(directoryPath, {
    pathPrefix: path.resolve(directoryPath), // see the note about pathPrefix below
    hidden: true, // use the default of false if you want to ignore files that start with '.'
  })
  console.log(`file(s) from ${JSON.stringify(files)}`);

  const storage = new NFTStorage({ token })

  // console.log(`storing file(s) from ${JSON.stringify(path)}`);
  console.log(`storing file(s) from ${path}`);

  const cid = await storage.storeDirectory(files)
  console.log({ cid })

  const status = await storage.status(cid)
  console.log(status)
}
main()
