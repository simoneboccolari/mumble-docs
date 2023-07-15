import * as dotenv from 'dotenv'
import { PineconeClient } from '@pinecone-database/pinecone'
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import * as readline from 'readline'
import { createPineconeIndex } from './utils/createPineconeIndex.js'
import { updatePinecone } from './utils/updatePinecone.js'
import { queryPineconeVectorStoreAndQueryLLM } from './utils/queryPineconeAndQueryLLM.js'

dotenv.config()

const loader = new DirectoryLoader('./documents', {
    '.txt': (path) => new TextLoader(path)
})

const docs = await loader.load()

const client = new PineconeClient()
await client.init({
    apiKey: process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_ENVIRONMENT
})

function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    return new Promise((resolve) =>
        rl.question(query, (ans) => {
            rl.close()
            resolve(ans)
        })
    )
}

const question = await askQuestion('Fai una domanda ')

const indexName = process.env.PINECONE_INDEX_NAME
const vectorDimension = process.env.PINECONE_VECTOR_DIMENSION

;(async () => {
    await createPineconeIndex(client, indexName, vectorDimension)
    await updatePinecone(client, indexName, docs)
    await queryPineconeVectorStoreAndQueryLLM(client, indexName, question)
})()
