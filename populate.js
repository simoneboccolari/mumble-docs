import * as dotenv from 'dotenv'
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import { PineconeClient } from '@pinecone-database/pinecone'
import { createPineconeIndex } from './utils/createPineconeIndex.js'
import { updatePinecone } from './utils/updatePinecone.js'

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

const indexName = process.env.PINECONE_INDEX_NAME
const vectorDimension = process.env.PINECONE_VECTOR_DIMENSION

;(async () => {
    await createPineconeIndex(client, indexName, vectorDimension)
    await updatePinecone(client, indexName, docs)
})()
