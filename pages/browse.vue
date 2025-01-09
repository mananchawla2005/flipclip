<script setup>
const user = useUser()
const data = ref([])
const isSearching = ref(false)
const router = useRouter()
const trendingData = ref(null)
const changeIsSearching = (val) => {
  isSearching.value = val
}
const searchState = ref(null)
const searchPapers = async () => {
  const papers = await $fetch('/api/papers', {
    params: {
      q: searchState.value.value
    }
  })
  data.value = papers
}

const goToPaper = async (t) => {
  if(t.type=="arxiv") {
    const arxivID = t.id.split('/abs/')[1]
    router.push("/arxiv/"+arxivID +"?title="+t.title)
  }
  else {
    router.push("/paper/" + t.paper_id)
  }
}

onMounted(async ()=>{
  const result = await $fetch('/api/list')
  trendingData.value = result
})
</script>
<template>
    <div>
      <div class="grid grid-cols-5 gap-3">
        <div class="size-[170px] pt-10 pl-10">
          <nuxt-link to="/browse"><img src="/fc.png"></nuxt-link>
        </div>
        <div class="col-span-3 relative" @mouseleave="changeIsSearching(false)" >
          <input @click="changeIsSearching(true)" ref="searchState" @keyup.enter="searchPapers" placeholder="search paper name or code" class="w-full spartan font-semibold border-2 px-10 border-black p-2 mt-16 rounded-3xl shadow-xl">
          <div class="p-5 z-10 absolute top-26 rounded-xl bg-white border-2 w-full" v-if="isSearching">
            <template v-for="t in data">
              <div class="bg-gray-100 rounded-xl my-2 p-2 px-5 hover:cursor-pointer" @click="goToPaper(t)">
                {{ t.title }}
              </div>
            </template>  
          </div>
        </div>
        <div>
          <button v-if="user==null" class="rounded-3xl p-2 mt-16 text-xl font-bold bg-[#F9D591] block ml-auto border-2 mr-16 border-black px-10">Sign Up</button>
          <button v-if="user!=null" class="rounded-3xl p-2 mt-16 text-xl font-bold bg-[#F9D591] block ml-auto border-2 mr-16 border-black px-10"><nuxt-link to="/profile">Profile</nuxt-link></button>

        </div>
      </div>
      <div class="w-fit ml-auto block">
        <div class="grid grid-cols-3 gap-3 mr-16 mt-10">
          <div>
          </div>
          <div>

          </div>
          <!-- <button class="spartan text-xl bg-black text-white px-5 py-1 rounded-3xl">Trending</button>
          <button class="spartan text-xl bg-black text-white px-5 py-1 rounded-3xl">Topic</button> -->
          <button class="spartan text-xl border-2 border-black px-5 py-1 rounded-3xl"><nuxt-link>Clipped</nuxt-link></button>
        </div>
      </div>
      <div class="border-2 border-black mt-16 w-fit pr-10 pl-10 rounded-r-3xl p-2 bg-[#B7E7F6] spartan text-xl font-semibold">Featured
      </div>
              <div class="ml-40 mx-24">
                <div class="grid grid-cols-4 gap-5 p-5 mx-5">
                  <template v-for="trend in trendingData" v-if="trendingData">
                    <nuxt-link :to="'/paper/'+trend.paper_id" class="bg-gray-100 rounded-xl block p-5 border-black border-2">
                      <img :src="trend.image_url" class="rounded-xl"/>
                      <h1>{{ trend.title }}</h1>
                    </nuxt-link>
                  </template>
                </div>
              </div>
    </div>
  </template>
  
  
  <style></style>