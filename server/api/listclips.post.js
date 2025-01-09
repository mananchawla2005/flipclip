export default defineEventHandler(async (event)=>{
    if(!event.context.user){
        return
    }
    const clips = await sql`select clips from auth_user where id=${event.context.user.id}`
    const clipArray = Array.from(clips[0].clips)
    var result = []
    let count = 0
    await new Promise( (resolve) => { 
        clipArray.forEach(async (x)=>{
            const tempResult = await sql`select * from paper_data where paper_id=${x}`
            console.log(tempResult[0])
            result.push(tempResult[0])
            count +=1
			if(count == clipArray.length) {
				resolve()
			}
        })
    })
    console.log(result)
    return result
})