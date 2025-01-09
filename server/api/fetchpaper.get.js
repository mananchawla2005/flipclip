export default defineEventHandler(async (event)=>{
    const paperId = getQuery(event)
    const response = await sql`select * from paper_data where paper_id=${paperId.id}`
    return response
})