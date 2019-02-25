<template>
    <div class="general">
        Interés por defecto (3 años): <input type="text" :value="general.interes"
            @blur="setInteres($event.target.value)"/>
            <br>
        Interes a 1 año: <input type="text" :value="general.intOne"
            @blur="setIntUno($event.target.value)"/>
            <br>
        Tiempo por defecto (días a 3 años): <input type="text" :value="general.periodo"
            @blur="setPeriodo($event.target.value)"/>
            <br>
        Dias a 1 año: <input type="text" :value="general.oneYear"
            @blur="setPerUno($event.target.value)"/>
            <br>
        Fecha inicio plazos: <input type="text" :value="general.inicio"
            @blur="setInicio($event.target.value)"/>
            <br>
    </div>
</template>

<script>
import {mapState, mapMutations} from 'vuex';
export default {
    data(){
        return{

        }
    },
    computed: mapState(['general']),
    methods: mapMutations(['setInteres','setIntUno','setPeriodo','setPerUno','setInicio'])
}
</script>

<style scoped>
input[type='text']{
    width: 80px;
    margin: 5px 10px;
}
</style>
