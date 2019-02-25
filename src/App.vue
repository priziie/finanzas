<template>
  <div class="container">
    <General />
    <br>
    <Conditions />
    <br>
    <input type="button" value="Calcular" @click="calculateMagic"/>
        Total: {{ total }}
    <Detail />
  </div>
</template>

<script>
import Conditions from './components/Conditions.vue'
import Detail from './components/Detail.vue'
import General from './components/General.vue'
import {mapMutations, mapGetters} from 'vuex';

export default {
  name: 'app',
  components:{
    Conditions,
    Detail,
    General
  },
  methods: mapMutations(['calculateMagic']),
  computed: mapGetters(['total'])
}
</script>

<style>
</style>
