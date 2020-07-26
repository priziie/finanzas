<template>
  <div>
    <br />
    <br />
    <input type="checkbox" name="edit" id="edit" v-model="edit" />
    <label for="edit">Editar</label>
    <!-- <div v-for="y in plazosByYear" :key="y.year"> -->
    <!-- Año {{ y.year }} -->
    <table>
      <tr>
        <th>Fecha inicio</th>
        <th>Fecha fin</th>
        <th>Tasa</th>
        <th>Días</th>
        <!-- <th>Cantidad</th> -->
        <th>Cantidad+int</th>
        <th>Int mensuales</th>
        <th>Ganancias al mes</th>
        <th>Sumado</th>
        <th>Acciones</th>
        <!-- <th>Generado al {{ y.year + (general.periodo/general.oneYear)}}</th> -->
      </tr>
      <tr v-for="(p, index) in plazosList" :key="index" :index="index">
        <td>
          <input
            v-if="edit"
            type="text"
            :value="
              p.startDate.toLocaleDateString('es-SV', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric'
              })
            "
            @blur="
              setStartDate({
                index: index,
                value: $event.target.value
              })
            "
          />
          <span v-if="!edit">
            {{
              p.startDate.toLocaleDateString('es-SV', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric'
              })
            }}
          </span>
        </td>
        <td>
          {{
            p.endDate.toLocaleDateString('es-SV', {
              year: 'numeric',
              month: 'numeric',
              day: 'numeric'
            })
          }}
        </td>
        <td>
          <input
            v-if="edit"
            type="text"
            :value="p.interes"
            @blur="
              setTasaPlazo({
                index: index,
                value: $event.target.value
              })
            "
          />
          <span v-if="!edit">{{ p.interes }}</span>
        </td>
        <td>
          <input
            v-if="edit"
            type="text"
            :value="p.periodo"
            @blur="
              setPeriodoPlazo({
                index: index,
                value: $event.target.value
              })
            "
          />
          <span v-if="!edit">{{ p.periodo }}</span>
        </td>
        <!-- <td>
          <input
            v-if="edit"
            type="text"
            :value="p.changeVal"
            @blur="
              setCuotaPlazo({
                index: index,
                value: $event.target.value
              })
            "
          />
          <span v-if="!edit">{{ p.changeVal }}</span>
        </td> -->
        <td>
        <input
          v-if="edit"
          type="text"
          :value="p.cantidad"
          @blur="
            setCantidadPlazo({
              index: index,
              value: $event.target.value
            })
          "
        />
        <span v-if="!edit">{{ p.cantidad }}</span>
        </td>
        <td>{{ p.intMensual }}</td>
        <td>{{ p.intTotalMes }}</td>
        <td>{{ p.sumado }}</td>
        <td>
          <button v-if="edit" @click="remove({ index: index })">
            Eliminar
          </button>
        </td>
        <!-- <td>{{ p.valFinal }}</td> -->
      </tr>
    </table>

    <!-- </div>  -->
  </div>
</template>

<script>
import { mapState, mapMutations, mapGetters, mapActions } from 'vuex';
export default {
  data() {
    return {
      edit: false
    };
  },
  computed: {
    ...mapState(['plazosByYear', 'general', 'plazosList']),
    obtnerPlazosDe(year) {
      if (this.plazos.length > 0) {
        // this.plazos.forEach(x => {
        //      console.log(x);
        // });
        return this.plazos
          .filter(x => x.startDate.getFullYear() == year)
          .map(p => {
            let options = { year: 'numeric', month: 'numeric', day: 'numeric' };
            var pls = {
              start: p.startDate.toLocaleDateString('es-SV', options),
              end: p.endDate.toLocaleDateString('es-SV', options),
              cuota: p.cuota,
              periodo: p.periodo,
              tasa: p.interes,
              total: p.valFinal
            };
            return pls;
          });
      }
    }
  },
  methods: {
    ...mapMutations([
      'addEmptyFilter',
      'updateFilterFrom',
      'updateFilterTo',
      'updateFilterCuota'
    ]),
    ...mapActions([
      'setTasaPlazo',
      'setCuotaPlazo',
      'setPeriodoPlazo',
      'setStartDate',
      'setCantidadPlazo',
      'remove'
    ])
  }
};
</script>

<style scoped>
input[type='text'] {
  width: 80px;
  margin: 5px 10px;
}
</style>
