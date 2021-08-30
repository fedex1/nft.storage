import { mutate, query } from './graphql.js'
import * as Result from './result.js'
import { configure } from './config.js'
import { script } from 'subprogram'
export const main = async () => await spawn(configure())

/**
 * @param {Object} config
 * @param {number} config.budget - Time budget
 * @param {number} config.batchSize - Number of tokens in each import
 * @param {import('./config').DBConfig} config.db
 * @param {import('./config').ERC721Config} config.erc721
 */
export const spawn = async (config) => {
  const deadline = Date.now() + config.budget
  console.log('Obtain current cursor')
  const cursor = await readCursor(config)
  let { id } = cursor
  while (deadline - Date.now() > 0) {
    const result = await importBatch(config, {
      id,
      batchSize: config.batchSize,
    })

    if (result.found < config.batchSize) {
      console.log('🏁 Finish scanning, not enough tokens were found')
      return
    } else {
      id = result.id
    }
  }
  console.log('⌛️ Finish scanning, time is up')
}

/**
 * @param {Object} config
 * @param {import('./config').ERC721Config} config.erc721
 * @param {import('./config').DBConfig} config.db
 * @param {Object} options
 * @param {string} options.id
 * @param {number} options.batchSize
 */
export const importBatch = async (config, { id, batchSize }) => {
  console.log(`⛓ Fetch ERC721 tokens from ${id}`)
  const tokens = await fetchTokens(config, {
    cursor: id,
    scanSize: batchSize,
  })
  console.log(`💾 Import ${tokens.length} tokens`)

  const result = await importTokens(config, {
    id,
    tokens,
  })

  console.log(
    `✨ Imported ${result.tokens.data.length} tokens, new cursor is "${result.nextID}"`
  )

  return {
    found: tokens.length,
    imported: result.tokens.data.length,
    id: result.nextID,
  }
}

/**
 * @param {Object} config
 * @param {import('./config').DBConfig} config.db
 */
const readCursor = async ({ db }) => {
  const result = await query(db, {
    cursor: {
      _id: 1,
      id: 1,
    },
  })

  return Result.value(result).cursor
}

/**
 *
 * @param {Object} config
 * @param {import('./config').DBConfig} config.db
 * @param {Object} input
 * @param {string} input.id
 * @param {import('../gen/erc721/schema').Token[]} input.tokens
 */
const importTokens = async ({ db }, input) => {
  const result = await mutate(db, {
    importERC721: [
      {
        input,
      },
      {
        _id: 1,
        id: 1,
        nextID: 1,
        tokens: [
          {
            _size: input.tokens.length,
          },
          {
            data: {
              _id: 1,
            },
          },
        ],
      },
    ],
  })
  return Result.value(result).importERC721
}

/**
 * @param {Object} config
 * @param {import('./config').ERC721Config} config.erc721
 * @param {{scanSize:number, cursor:string}} settings
 * @returns {Promise<import('../gen/erc721/schema').Token[]>}
 */
const fetchTokens = async ({ erc721 }, { cursor, scanSize }) => {
  const result = await query(erc721, {
    tokens: [
      {
        first: scanSize,
        where: {
          tokenURI_not: '',
          id_gt: cursor,
        },
      },
      {
        id: 1,
        tokenID: 1,
        tokenURI: 1,
        mintTime: 1,
        blockNumber: 1,
        blockHash: 1,
        contract: {
          id: 1,
          name: 1,
          symbol: 1,
          supportsEIP721Metadata: 1,
        },
        owner: {
          id: 1,
        },
      },
    ],
  })

  return Result.value(result).tokens
}

script({ ...import.meta, main })