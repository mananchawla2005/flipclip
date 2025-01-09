import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { generateId } from "lucia";
import { TaskType } from "@google/generative-ai";
import { WebPDFLoader } from "langchain/document_loaders/web/pdf";
import { LLMChain } from "langchain/chains"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PromptTemplate } from "@langchain/core/prompts";
import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob'

import pgvector from 'pgvector/pg';
export default defineEventHandler(async (event)=>{
	console.log("indexing")
	const config = useRuntimeConfig()
    const arxivID = getQuery(event).id 
    const arxivTitle = getQuery(event).title
    const arxivUrl = "http://arxiv.org/pdf/" + arxivID + ".pdf"
	let blob = await fetch(arxivUrl).then(r => r.blob())
	console.log("downloaded")
	const loader = new WebPDFLoader(blob)
	const docs = await loader.load()
	const textSplitter = new RecursiveCharacterTextSplitter({
		chunkSize: 1000,
		chunkOverlap: 200,
	})
	const splitDocs = await textSplitter.splitDocuments(docs);
	const model = new ChatGoogleGenerativeAI({
        apiKey: config.googleApiKey,
        modelName: "gemini-pro",
        maxOutputTokens: 2048,
    })
	const embeddings = new GoogleGenerativeAIEmbeddings({
		apiKey: config.googleApiKey,
		modelName: "text-embedding-004", // 768 dimensions
		taskType: TaskType.RETRIEVAL_DOCUMENT,
		title: "Document title",
	});
	var data = []
	splitDocs.forEach((s)=>{
		data.push(s.pageContent.replace(/\x00/g, ''))
	})
	const res = await embeddings.embedDocuments(data)
    const titleEmbedding = await embeddings.embedQuery(arxivTitle)
    const paperId = generateId(15)
	for (let index = 0; index < res.length; index++) {
		await sql`insert into papers(paper_id, body, body_embedding) values(${paperId}, ${data[index]}, ${pgvector.toSql(res[index])}) returning id`
	}
	console.log('done uploading')
	const promptText = `
        You are an assistant that helps summarize long documents. 
        Here is the document data:
        {document_data}

        Paper Title:
        {title}

        Read the above document and answer the users question below.:
        {query}
    `
    // creates a langchain prompt which can accept multiple variables at runtime
    const multiPromptTemplate = new PromptTemplate({
    inputVariables: ["document_data", "query", "title"],
    template: promptText,
    });
	const quesRes = await embeddings.embedQuery('Can you summarise the document ?')
    const paperData = await sql`SELECT * FROM papers where paper_id=${paperId}
    ORDER BY body_embedding <-> ${pgvector.toSql(quesRes)}
    LIMIT 10`
	var content = []
	paperData.forEach((d)=>{
		content.push(d.body)})
	const paperChain = new LLMChain({ llm: model, prompt: multiPromptTemplate });
	const paperResponse = await paperChain.call({
		document_data: content.join('\n\n'),
		query: "Can you summarise the document ?",
		title:  arxivTitle// whatever you want to searh in the document
	});
	const faqPromptText = `
	You are an assistant that helps writee faqs in json format.
	
	Format: {faq_format}

	Here is the document data:
	{document_data}

	Paper Title:
	{title}

	Read the above document and answer the users question below. Stick to the format dont add anything above or below not even backtics.
	{query}
`
	const faqJson = `[{
		"question": <generated_question>,
		"answer": <generated_answer>
	}]`
	const faqMultiPromptTemplate = new PromptTemplate({
		inputVariables: ["document_data", "query", "title", "faq_format"],
		template: faqPromptText,
	});
	const faqPaperChain = new LLMChain({ llm: model, prompt: faqMultiPromptTemplate });
	const faqPaperResponse = await faqPaperChain.call({
		document_data: content.join('\n\n'),
		query: "Can you generate faqs for the document ?",
		title:  arxivTitle, // whatever you want to searh in the document,
		faq_format: faqJson
	});
	const blogPromptText = `
	Context: {document_data}
	Format: {format}
	As an experienced data scientist and technical writer, generate an outline for a blog about {title}. Ans should be strictly in json as per the format specified and wrapped around an array. Nothing not even backticks should be there in front or end of the format specified. Generate minimum 5 section headings.
`
	const blogJson = `[{
        heading: <section heading>,
        outline: [<array of generated points for that heading>
    }]`
	const blogMultiPromptTemplate = new PromptTemplate({
		inputVariables: ["document_data", "title", "format"],
		template: blogPromptText,
	});
	const blogPaperChain = new LLMChain({ llm: model, prompt: blogMultiPromptTemplate });
	var attempt = 0
	var total = 3
	var blog = []
	var blogPoints;
	console.log(arxivTitle)
	while(attempt<total){
		try {
			const blogPaperResponse = await blogPaperChain.call({
				document_data: paperResponse.text,
				title:  arxivTitle, // whatever you want to searh in the document,
				format: blogJson
			});
			console.log(blogPaperResponse.text)
			blogPoints = JSON.parse(blogPaperResponse.text)
			console.log("parsing success")
			break
		} catch (error) {
			attempt+=1
		}
	}
	if (!blogPoints || blogPoints.length === 0) {
		console.log('No blog points generated, using default structure');
		return {
			statusCode: "500",
			message: "Internal Server Occured"
		}
	}
	const sectionPromptText = `
	You are an assistant that generates blog section given the context. 
	Here is the document data:
	{document_data}

	Paper Title:
	{title}

	Section Title:
	{section_title}

	Read the above extracted context, sum it up based on following query and form it into a blog section para of about 250 words. Just give the context dont start with the heading. The blog should have a flow , it should be able to summarise each and every topic with details in a simplified manner.:
	{query}
	`
	const sectionMultiPromptTemplate = new PromptTemplate({
		inputVariables: ["document_data", "query", "section_title", "title"],
		template: sectionPromptText,
		});
	let count = 0
	await new Promise( (resolve) => { 
		blogPoints.forEach(async (p)=>{
			var sectionContent = []
			p.outline.forEach(async (x)=>{
				const res = await embeddings.embedQuery(x)
				const sectionData = await sql`SELECT * FROM papers where paper_id=${paperId}
				ORDER BY body_embedding <-> ${pgvector.toSql(res)}
				LIMIT 10`
				sectionData.forEach((d)=>{
					sectionContent.push(d.body)})
			})
			const chain = new LLMChain({ llm: model, prompt: sectionMultiPromptTemplate });
			const response = await chain.call({
				document_data: sectionContent.join('\n\n'),
				section_title: p.heading,
				title: arxivTitle,
				query: p.outline.join(', '), // whatever you want to searh in the document
			})
			console.log(response.text)
			blog.push({
				heading: p.heading,
				context: response.text
			})
			count +=1
			if(count == blogPoints.length) {
				resolve()
			}
	
		})
	})		
	console.log(blog)
	const imagePrompt = await model.invoke(`Generate a stable diffusion prompt for cover image of research paper titled ${arxivTitle}`)
	    
    const ACCOUNT_ID = useRuntimeConfig().cloudflareAccountId;
    const API_TOKEN = useRuntimeConfig().cloudflareAccountSecret;
    
    const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/@cf/bytedance/stable-diffusion-xl-lightning`;
    console.log(imagePrompt.lc_kwargs.content)
    const requestOptions = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/octet-stream'
      },
      body: JSON.stringify({
        prompt: imagePrompt.lc_kwargs.content
      })
    };
    const imageData = await fetch(url, requestOptions)
	const blobBuffer = await imageData.arrayBuffer()
	let accountName = 'protrack', accountKey = useRuntimeConfig().azureIndex;
	console.log(config)
	const storageAccountBaseUrl = `https://${accountName}.blob.core.windows.net`,
		sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

	const blobServiceClient = new BlobServiceClient(
		storageAccountBaseUrl,
		sharedKeyCredential
	);
	const containerClient = blobServiceClient.getContainerClient('resume');
	const blockBlobClient = containerClient.getBlockBlobClient(`${paperId}`);
	const x = await blockBlobClient.uploadData(blobBuffer, {
		blockSize: blobBuffer.byteLength,
		blobHTTPHeaders: {
			blobContentType: 'image/png'
		}
	})
	console.log(x._response.request.url)
	
	await sql`insert into paper_data values(${paperId}, ${paperResponse.text}, ${blog}, ${x._response.request.url},  ${arxivTitle}, ${pgvector.toSql(titleEmbedding)}, ${arxivID}, ${JSON.parse(faqPaperResponse.text)})`
	console.log(paperResponse)
    return paperId
})