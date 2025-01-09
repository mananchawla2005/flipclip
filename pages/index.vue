<script setup lang="js">
const user = useUser()
const router = useRouter()
if(user.value!=null) {
    router.push('/browse')
}
const openedFeature = ref(null)
const openFeature = (n, state) => {
    if(state=='open') {
        openedFeature.value = n
    }
    else if(state=='close') {
        console.log("here")
        openedFeature.value = null
    }
}
</script>
<template>
    <div class="min-h-screen relative">
        <div class="grid grid-cols-2">
            <div class="size-[170px] pt-10 pl-7 ">
                <nuxt-link to="/browse"><img src="/fc.png"></nuxt-link>
            </div>
          <div class="ml-auto mr-20 mt-16 spartan text-2xl font-semibold"><h1 class="border-b-[3px] hover:cursor-pointer relative z-10 border-black"><nuxt-link external to="/login">Login</nuxt-link></h1></div>
        </div>
        <div class="relative">
            <div class="text-center text-5xl font-semibold  absolute w-full z-10 top-0 spartan ">Unlock Knowledge with a
                Click <br>
                Simplifying Complex Research Papers for All
                <h1 class=" mt-10 text-4xl font-medium">Click to Peek, Flip to Recap!</h1>
                <button class=" mt-10 text-3xl bg-[#F9D692] p-2 px-10 rounded-3xl">Browse Paper</button>
            </div>
            <div class="w-full h-[70vh] bg-gradient-to-b from-sky-500 to-pink-500 rounded-full blur-[150px] "></div>

        </div>
        <div class="absolute w-full bottom-0">
            <div class="grid grid-rows-auto grid-cols-4 gap-x-10 ml-10 mr-10 mt-3 relative z-10">
                <div @mouseleave="openFeature('audio', 'close')" @mouseover="openFeature('audio', 'open')" class="bg-[#A294FB]  text-2xl font-semibold spartan text-center p-3 rounded-t-xl">Audio Explanation
                    <p  v-if="openedFeature=='audio'">
                        This is some big blob of content This is some big blob of content  This is some big blob of content
                    </p>
                </div>
                <div class="bg-[#B7E7F6] text-2xl font-semibold spartan text-center p-3 rounded-t-xl">Research Summary</div>
                <div class="bg-[#FFB4F3] text-2xl font-semibold spartan text-center p-3 rounded-t-xl">Article Explanation</div>
                <div class="bg-[#F9BD91] text-2xl font-semibold spartan text-center p-3 rounded-t-xl">Bookmark Your Favourites</div>
            </div>
        </div>

    </div>
</template>
<style scoped>
</style>