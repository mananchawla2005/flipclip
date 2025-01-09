<script setup>
const route = useRoute()
const router = useRouter()
console.log(route.params.slug)
onMounted(async ()=>{
    const paperId = await $fetch('/api/indexArxiv', {
        params: {
            id: route.params.slug,
            title: route.query.title
        }
    })

    window.location.href = '/paper/' + paperId
    
})
</script>
<template>
    <div class="min-h-screen relative">
        <div class="grid grid-cols-3">
            <div class="size-[170px] pt-10 pl-7 ">
                <img src="/fc.png">
            </div>
            <div>
                <h1 class="mt-16 w-full text-center font-bold spartan text-2xl">Indexing Paper...</h1>
            </div>
        </div>
        
        <img src="/loading.gif" class="block mx-auto"/>
    </div>
</template>
<style scoped>
</style>