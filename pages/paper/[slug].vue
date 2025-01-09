<script lang="js" setup>
const route = useRoute()
const paperData = ref(null)
const viewArticle = ref(false)
const user = useUser()

const isChatWindow = ref(false)
const toggleChatWindow = () => {
  isChatWindow.value = !isChatWindow.value
}
const inputSearchState = ref(null)
const conversationHistory = reactive([])
const data = ref([])
const isSearching = ref(false)
const router = useRouter()
const referenceData = ref(null)
const audioUrl = ref("")
const changeView = () => {
  viewArticle.value = !viewArticle.value
  console.log(viewArticle.value)
}
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
  if (t.type == "arxiv") {
    const arxivID = t.id.split('/abs/')[1]
    router.push("/arxiv/" + arxivID + "?title=" + t.title)
  }
}

const askNow = async () => {
  conversationHistory.push({
    role: "user",
    message: inputSearchState.value.value
  })
  const tempState = inputSearchState.value.value
  inputSearchState.value.value = ""
  const reply = await $fetch('/api/reply', {
    method: "POST",
    body: {
      q: tempState,
      id: route.params.slug,
      title: paperData.value[0].title
  }})
  conversationHistory.push({
    role: "agent",
    message: reply
  })

}
onMounted(async () => {
  console.log("hello2")
  const result = await $fetch('/api/fetchpaper', {
    params: {
      id: route.params.slug
    }
  })
  paperData.value = result
  console.log(paperData)
  const result2 = await $fetch('/api/similarpaper', {
    params: {
      id: route.params.slug,
      title: paperData.value[0].title
    }
  })

  referenceData.value = result2
  const result3 = await $fetch('/api/getaudio', {
    params: {
      id: route.params.slug
    }
  })
  audioUrl.value = result3
})

const clipPaper = async () => {
  await $fetch('/api/clip', {
    method: 'POST',
    body: {
      paperId: route.params.slug
    }
  })
  user.value.clips.push(route.params.slug)
}

const removeClip = async () => {
  await $fetch('/api/removeClip', {
    method: 'POST',
    body: {
      paperId: route.params.slug
    }
  })
  user.value.clips.splice(user.value.clips.indexOf(route.params.slug), 1)
}
</script>
<template>
  <div>
    <div class="grid grid-cols-5 gap-3">
      <div class="size-[170px] pt-10 pl-10">
        <nuxt-link to="/browse"><img src="/fc.png"></nuxt-link>
      </div>
      <div class="col-span-3 relative" @mouseleave="changeIsSearching(false)">
        <input @click="changeIsSearching(true)" ref="searchState" @keyup.enter="searchPapers"
          placeholder="search paper name or code"
          class="w-full spartan font-semibold border-2 px-10 border-black p-2 mt-16 rounded-3xl shadow-xl">
        <div class="p-5 z-10 absolute top-26 rounded-xl bg-white border-2 w-full" v-if="isSearching">
          <template v-for="t in data">
            <div class="bg-gray-100 rounded-xl my-2 p-2 px-5 hover:cursor-pointer" @click="goToPaper(t)">
              {{ t.title }}
            </div>
          </template>
        </div>
      </div>
      <div>
        <button  v-if="user == null"
          class="rounded-3xl p-2 mt-16 text-xl font-bold bg-[#F9D591] block ml-auto border-2 mr-16 border-black px-10">Sign
          Up</button>
          <button v-if="user!=null" class="rounded-3xl p-2 mt-16 text-xl font-bold bg-[#F9D591] block ml-auto border-2 mr-16 border-black px-10"><nuxt-link to="/profile">Profile</nuxt-link></button>

      </div>
    </div>
    <div class="grid grid-cols-[30%_60%_10%]" :class="{ '!hidden': viewArticle }">
      <div class="pl-12 ">
        <img class="block mx-auto rounded-3xl mt-10 h-64 w-full" :src="paperData ? paperData[0].image_url : '#'">
        <button @click="changeView"
          class="mt-10 block mx-auto  border-2 border-black bg-[#F9D591] p-2 px-10 spartan text-xl font-semibold rounded-3xl">Read
          Article Explanation Here</button>
          <audio controls="controls" class="mx-auto mt-10" v-if="audioUrl!=''">
            <source :src="audioUrl" type="audio/wav" />
            </audio>
      </div>
      <div class=" mt-10">
        <!-- <button class="spartan rounded-3xl bg-[#B7E7F6] text-xl font-medium p-2 px-10 mx-10"> Category</button> -->
        <button class="spartan rounded-3xl border-[3px] border-[#FD6C6C] text-xl font-medium p-1 px-10 ml-10" v-if="paperData">
          <div v-if="user.clips.includes(route.params.slug)"  @click="removeClip">
            <Icon name="heroicons:paper-clip-20-solid" class="pr-2 my-auto mx-auto size-[30px]" v-if="paperData[0].id in user.clips"/> Unclip
          </div>
          <div v-if="!(user.clips.includes(route.params.slug))"  @click="clipPaper" >
            <Icon name="heroicons:paper-clip-20-solid" class="pr-2 my-auto mx-auto size-[30px]" /> Clip
          </div>
          
        </button>
        <div class="text-2xl spartan font-semibold mx-10 mt-7">Paper Title : {{ paperData ? paperData[0].title : '' }}
        </div>
        <!-- <div class="text-sm spartan font-medium mx-10 mt-3 text-gray-600"> Author : This is the author of the paper
        </div> -->
        <div class="text-sm spartan font-medium mx-10 mt-3 text-gray-600" v-if="paperData"> Link to paper <nuxt-link
            external :to="'http://arxiv.org/abs/' + paperData[0].arxiv_id">Here</nuxt-link>
        </div>
        <div class=" mt-10 mx-10 min-h-56 rounded-3xl shadow-xl border-2 border-gray-300/50">
          <div class="text-xl spartan font-semibold p-2 my-10 mx-10 mt-2 drop-shadow-xl  ">
            <div class="border-b-[3px] w-fit border-black mt-[0.25rem]">
              About this paper
            </div>
            <div class="mt-5">
              {{ paperData ? paperData[0].summary : '' }}
            </div>
          </div>
        </div>
      </div>
      <Icon name="bitcoin-icons:flip-vertical-filled" class="size-[40px] block ml-auto mt-10 mr-16 " />
      <div>

      </div>
    </div>
    <div class="hidden" :class="{ '!block': viewArticle }">
      <div class="w-full">
        <Icon @click="changeView" name="bitcoin-icons:flip-vertical-filled" class="hover:cursor-pointer size-[40px] block ml-auto mt-10 mr-16 w-full" />
      </div>
      <div class="px-16 w-full mt-10">
        <div class="mx-16">
          <img class="block rounded-3xl my-10 h-36" :src="paperData ? paperData[0].image_url : '#'">
          <template v-if="paperData" v-for="a in paperData[0].article">
            <h1 class="text-3xl font-bold spartan mb-2">
              {{ a.heading }}
            </h1>
            <p class="text-gray-800 mb-2">
              {{ a.context }}
            </p>
          </template>
        </div>
      </div>
    </div>
    <div class="mt-16 pl-10 text-2xl font-bold ">
      Commonly asked questions
    </div>
    <div class="border-2 w-[90%] ml-10 pl-5 mt-5 rounded-2xl border-gray-300/50 shadow-xl drop-shadow-2xl h-fit">
      <div class="text-lg p-2 mx-5">
        <template v-for="faq in paperData[0].faq" v-if="paperData">
          <details class="mb-2 mt-2">
            <summary class="font-semibold">{{ faq.question }}</summary>
            <p class="ml-4 text-md">{{ faq.answer }}</p>
          </details>
          <hr>
        </template>
      </div>

    </div>
    <!-- <div class="mt-10">
      <h1 class="text-2xl font-bold ml-10">Reference Topics</h1>
    </div> -->
    <div class="mt-10">
      <h1 class="text-2xl font-bold ml-10">Reference Papers</h1>
      <div class="grid grid-cols-4 gap-5 p-5 mx-5">
        <template v-for="refer in referenceData" v-if="referenceData">
          <NuxtLink :to="'/paper/'+refer.paper_id" class="block bg-gray-100 rounded-xl p-5 border-black border-2">
            <img :src="refer.image_url" class="rounded-xl"/>
            <h1>{{ refer.title }}</h1>
          </NuxtLink>
        </template>
      </div>
    </div>
    <div class="fixed bottom-2 right-2 w-10 h-10 bg-white border-black border-2 shadow-xl rounded-full cursor-pointer" @click="toggleChatWindow">
      <Icon name="solar:clipboard-bold-duotone" size="25" class="ml-1 mt-1 block"/>
    </div>
    <div class="fixed bottom-20 right-10 w-72 h-96 bg-white shadow-xl border-black border-2 rounded-xl" v-if="isChatWindow">
      <h1 class="mx-5 text-center mt-2 font-bold text-xl">
        Ask Questions From this research paper
      </h1>
      <div class="chat-history-container h-[80%] overflow-y-auto p-5">
        <!-- Conversation history template loop goes here -->
        <template v-for="convo in conversationHistory" class="">
          <div v-if="convo.role=='user'" class="p-5 bg-gray-100 rounded-xl my-2">
            USER: {{ convo.message }}
          </div>
          <div v-if="convo.role=='agent'" class="p-5 bg-blue-300 rounded-xl my-2">
            CLIP: {{ convo.message }}
          </div>
        </template>
      </div>
      <input ref="inputSearchState" type="text" @keyup.enter="askNow" class="w-full h-10 absolute bottom-0 p-1 rounded-xl border-t-2 border-black" placeholder="hello" />
    </div>
  </div>
</template>


<style></style>