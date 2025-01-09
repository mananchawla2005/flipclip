export default defineEventHandler(async (event)=>{
    const data = await sql`select * from paper_data`
    return data
})