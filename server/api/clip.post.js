export default defineEventHandler(async (event)=>{
    if(!event.context.user) {
        return
    }
    else {
        const body = await readBody(event)
        const paperId = body.paperId
        console.log(paperId)
        console.log(event.context.user)
        await sql`update auth_user set clips=array_append(clips, ${paperId}) where id=${event.context.user.id}`
    }
})