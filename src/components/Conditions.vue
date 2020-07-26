<template>
  <div class="main">
    <div class="conditions" v-for="(c, index) in conditions" :key="index">
      Desde:
      <input
        type="text"
        :value="c.from"
        :index="index"
        @blur="updateFilterFrom({index: index, value: $event.target.value})"
      />
      Hasta:
      <input
        type="text"
        :value="c.to"
        :index="index"
        @blur="updateFilterTo({index: index, value: $event.target.value})"
      />
      Cuota:
      <input
        type="text"
        :value="c.cantidad"
        :index="index"
        @blur="updateFilterCuota({index: index, value: $event.target.value})"
      />
      <input type="button" value="Eliminar" @click="removeFilter(index)" />
      <input
        type="button"
        value="Más filtros"
        @click="addEmptyFilter"
        v-if="index == (conditions.length-1)"
      />
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
export default {
  data() {
    return {};
  },
  computed: mapState(["conditions"]),
  methods: mapMutations([
    "addEmptyFilter",
    "updateFilterFrom",
    "updateFilterTo",
    "updateFilterCuota",
    "removeFilter"
  ])
};
</script>

<style scoped>
input[type="text"] {
  width: 80px;
  margin: 5px 10px;
}
</style>
