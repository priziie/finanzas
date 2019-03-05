<template>
    <div>
        <br>
        <br>
        <!-- <div v-for="y in plazosByYear" :key="y.year"> -->
            <!-- Año {{ y.year }} -->
            <table>
                <tr>
                    <th>Fecha inicio</th>
                    <th>Fecha fin</th>
                    <th>Tasa</th>
                    <th>Años</th>
                    <th>Cantidad</th>
                    <th>Int mensuales</th>
                    <th>Ganancias al mes</th>
                    <th>Sumado</th>
                    <!-- <th>Generado al {{ y.year + (general.periodo/general.oneYear)}}</th> -->
                </tr>    
                <tr v-for="(p, index) in plazosList" :key="index" :index ="index">
                    <td>{{ p.startDate.toLocaleDateString('es-SV', { year: 'numeric', month: 'numeric', day: 'numeric' }) }}</td>
                    <td>{{ p.endDate.toLocaleDateString('es-SV', { year: 'numeric', month: 'numeric', day: 'numeric' }) }}</td>
                    <td>
                        <!-- <input type="text" :value="p.interes" @blur="setTasaPlazo({
                            index: index, value: $event.target.value
                        })"/>  -->
                        {{p.interes}}
                    </td>
                    <td>
                        <!-- <input type="text" :value="p.periodo"  @blur="setPeriodoPlazo({
                            index: index, value: $event.target.value
                        })"/>  -->
                        {{p.periodo}}
                    </td>
                    <td>
                        <!-- <input type="text" :value="p.cuota" @blur="setCuotaPlazo({
                            index: index, value: $event.target.value
                        })"/> -->
                        {{p.cuota}}
                    </td>
                    <td>{{ p.intMensual }}</td>
                    <td>{{ p.intTotalMes }}</td>
                    <td>{{p.sumado}}</td>
                    <!-- <td>{{ p.valFinal }}</td> -->
                </tr>
            </table>
        <!-- </div>  -->
    </div>
</template>

<script>
import {mapState, mapMutations, mapGetters, mapActions} from 'vuex';
export default {
    data(){
        return{
            
        }
    },
    computed: {
        ...mapState(['plazosByYear','general','plazosList']),
        obtnerPlazosDe(year){
            if(this.plazos.length > 0){
                // this.plazos.forEach(x => {
                //      console.log(x); 
                // });
                return this.plazos.filter(x =>x.startDate.getFullYear() == year)
                            .map(p=> {
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
                            })
            }
        }
    },
    methods: {
        ...mapMutations(['addEmptyFilter','updateFilterFrom','updateFilterTo','updateFilterCuota']),
        ...mapActions(['setTasaPlazo','setCuotaPlazo','setPeriodoPlazo'])
    }
}
</script>

<style scoped>
input[type='text']{
    width: 80px;
    margin: 5px 10px;
}
</style>
