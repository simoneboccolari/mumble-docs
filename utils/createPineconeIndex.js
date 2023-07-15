export async function createPineconeIndex(client, indexName, vectorDimension) {
    const existingIndexs = await client.listIndexes()

    if (!existingIndexs.includes(indexName)) {
        console.log('Creating index')

        const createClient = await client.createIndex({
            createRequest: {
                name: indexName,
                dimension: vectorDimension,
                metric: 'cosine'
            }
        })

        await new Promise((resolve) => setTimeout(resolve, 60000))
    } else {
        console.log('Index already exists')
    }
}
