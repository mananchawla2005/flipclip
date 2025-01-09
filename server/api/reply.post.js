import pgvector from 'pgvector/pg';
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { LLMChain } from "langchain/chains"
import { PromptTemplate } from "@langchain/core/prompts";

export default defineEventHandler(async (event)=>{
    const config = useRuntimeConfig()
    const model = new ChatGoogleGenerativeAI({
        apiKey: config.googleApiKey,
        modelName: "gemini-1.5-flash",
        maxOutputTokens: 2048,
    })
    const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: useRuntimeConfig().googleApiKey,
		modelName: "text-embedding-004", // 768 dimensions
		taskType: TaskType.RETRIEVAL_DOCUMENT,
		title: "Document title",
	});
    const promptText = `
    You are an assistant that helps answer questions from long documents. 
    Here is the document data:
    {document_data}
    
    Paper Title:
    {title}
    
    Read the above document and answer the users question below:
    {query}
    `
    const multiPromptTemplate = new PromptTemplate({
        inputVariables: ["document_data", "query", "title"],
        template: promptText,
    });
    const body = await readBody(event)
    const quesRes = await embeddings.embedQuery(body.q)
    const paperData = await sql`SELECT * FROM papers where paper_id=${body.id}
    ORDER BY body_embedding <-> ${pgvector.toSql(quesRes)}
    LIMIT 10`
    console.log(paperData)
	var content = []
	paperData.forEach((d)=>{
		content.push(d.body)})
	const paperChain = new LLMChain({ llm: model, prompt: multiPromptTemplate });
	const paperResponse = await paperChain.call({
		document_data: content.join('\n\n'),
		query: body.q,
		title:  body.title// whatever you want to searh in the document
	});
    return paperResponse.text
})