import * as dotenv from 'dotenv'
import { PineconeClient } from '@pinecone-database/pinecone'
import * as readline from 'readline'
import { queryPineconeVectorStoreAndQueryLLM } from './utils/queryPineconeAndQueryLLM.js'

dotenv.config()

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

;(async () => {
    await queryPineconeVectorStoreAndQueryLLM(client, indexName, question)
})()
