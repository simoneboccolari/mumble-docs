import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { OpenAI } from 'langchain/llms/openai'
import { loadQAStuffChain } from 'langchain/chains'
import { Document } from 'langchain/document'
export const queryPineconeVectorStoreAndQueryLLM = async (client, indexName, question) => {
    console.log('Querying Pinecone vector store')
    // Get Pinecone index
    const index = client.Index(indexName)
    // Create query embedding with OpenAI api
    const queryEmbedding = await new OpenAIEmbeddings().embedQuery(question)
    // Query Pinecone index and return top 3 matches
    // Increase topK to return a higher number of matches (more expensive)
    let queryResponse = await index.query({
        queryRequest: {
            topK: 5,
            vector: queryEmbedding,
            includeMetadata: true,
            includeValues: true
        }
    })
    console.log(`Found ${queryResponse.matches.length} matches`)
    console.log(`Asking question: ${question}`)

    if (queryResponse.matches.length) {
        // Create an OpenAI instance and load the QAStuffChain
        const llm = new OpenAI({
            modelName: 'gpt-3.5-turbo'
        })
        const chain = loadQAStuffChain(llm)
        // Extract and concatenate page content from matched documents
        const concatenatedPageContent = queryResponse.matches
            .map((match) => match.metadata.pageContent)
            .join(' ')
        // Execute the chain with input documents and question
        const result = await chain.call({
            input_documents: [new Document({ pageContent: concatenatedPageContent })],
            question: question
        })
        console.log(`Answer: ${result.text}`)
    } else {
        console.log('Since there are no matches, GPT-3 will not be queried.')
    }
}
