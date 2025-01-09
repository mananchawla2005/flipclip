<script lang="js" setup>
const user = useUser()
const profileData = ref(null)
onMounted(async ()=>{
  const result = await $fetch('/api/listclips', {
    method: 'POST'
  })
  console.log(result)
  profileData.value = result
})
</script>

<template>
  <div>
    <div class="min-h-screen relative">
      <div class="grid grid-cols-2">
        <div class="size-[170px] pt-10 pl-7 ">
          <nuxt-link to="/browse"><img src="/fc.png"></nuxt-link>
        </div>
      </div>

      <div class="grid grid-cols-[10%_90%]">
        <div class="sticky self-start">
        
          <div class="bg-amber-200 rounded-r-[46px] w-[80px] h-[45px]">" "</div>
          <div class="bg-sky-200 rounded-r-[46px] w-[80px] h-[45px] mt-5">" "</div>
          <div class="bg-fuchsia-300 rounded-r-[46px] w-[80px] h-[45px] mt-5">" "</div>
          <div class="bg-violet-400 rounded-r-[46px] w-[80px] h-[45px] mt-5">" "</div>
        </div>
        <div>
          <div class="text-xl font-bold mx-auto block w-fit mb-10">
            Full Name: {{ user ? user.fullname : '' }} <br />
            Email: {{ user? user.email: '' }}
            
          </div>
          <div class="mr-10 bg-gray-100 p-5">
            <div class="grid grid-cols-4 gap-5 p-5 mx-5">
                  <template v-for="p in profileData" v-if="profileData">
                    <nuxt-link :to="'/paper/'+p.paper_id" class="bg-gray-100 rounded-xl block p-5 border-black border-2">
                      <img :src="p.image_url" class="rounded-xl"/>
                      <h1>{{ p.title }}</h1>
                    </nuxt-link>
                  </template>
            </div>
          </div>
        </div>
      </div>

      <div class="absolute bottom-0 w-fit mb-2 ml-10 text-lg font-semibold text-gray-600">
        Sign Out
      </div>
    </div>

   


  </div>
</template>


<style></style>