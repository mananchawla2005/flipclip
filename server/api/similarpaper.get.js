import { xmlToJsonUtil } from 'xml-to-json-util'
import {GoogleGenerativeAIEmbeddings} from '@langchain/google-genai'
import pgvector from 'pgvector/pg';
import { TaskType } from "@google/generative-ai";

export default defineEventHandler(async (event)=>{
    const paperId  = getQuery(event).id
    const title = getQuery(event).title
    const embeddings = new GoogleGenerativeAIEmbeddings({
		apiKey: useRuntimeConfig().googleApiKey,
		modelName: "text-embedding-004", // 768 dimensions
		taskType: TaskType.RETRIEVAL_DOCUMENT,
		title: "Document title",
	});
    const titleSearch =  await embeddings.embedQuery(`${title}`)
    const dataFromDATABASE = await sql`
      SELECT
        paper_id,
        image_url,
        title,
        title_embedding <-> ${pgvector.toSql(titleSearch)} AS similarity_score
      FROM
        paper_data
      ORDER BY
        paper_id, similarity_score ASC
      LIMIT 10
  `
    console.log(dataFromDATABASE)
    return dataFromDATABASE

})