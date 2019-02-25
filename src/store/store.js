import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export const store = new Vuex.Store({
    state: {
        conditions: [{
            from: 2020,
            to: 2040,
            cuota: 250
        }],
        general:{
            inicio: '15-02-2020',
            interes: 0.07,
            periodo: 1080,
            intOne: 0.0525,
            oneYear: 360
        },
        plazosByYear: []
    },
    getters:{
        total(state){
            if(state.plazosByYear.length > 0){
                console.log(state.conditions[state.conditions.length-1].to)
                return state.plazosByYear
                    .map(p=> {
                        return  p.plazos.filter(x=> x.endDate.getFullYear() == state.conditions[state.conditions.length-1].to)
                                .reduce((acc, cur) => acc + cur.valFinal,0)
                    }).reduce((acc, cur) => acc + cur,0)
                    
            }
            return 0;
        }

    },
    mutations:{
        addEmptyFilter(state ){
            var emptyRow = {
                from: null,
                to: null,
                cuota: null
            }
            state.conditions.push(emptyRow)
        },
        updateFilterFrom(state, {index,value}){
            state.conditions[index].from = value;
        },
        updateFilterTo(state, {index,value}){
            state.conditions[index].to = value;
        },
        updateFilterCuota(state, {index,value}){
            state.conditions[index].cuota = value;
        },
        setInteres(state, value){
            state.general.interes = value;
        },
        setIntUno(state, value){
            state.general.intOne = value;
        },
        setPeriodo(state, value){
            state.general.periodo = value;
        },
        setPerUno(state, value){
            state.general.oneYear = value;
        },
        setTasaPlazo(state, {year, index, value}){
            let row = state.plazosByYear.find(x=>x.year == year).plazos[index];
            row.interes = parseFloat(value)
            
            let vf = Math.round(row.cuota * Math.pow((1+row.interes),(row.periodo/state.general.oneYear)) * 100) / 100;
            row.valFinal = vf
        },
        setCuotaPlazo(state, {year, index, value}){
            let row = state.plazosByYear.find(x=>x.year == year).plazos[index];
            row.cuota = parseFloat(value)
            
            let vf = Math.round(row.cuota * Math.pow((1+row.interes),(row.periodo/state.general.oneYear)) * 100) / 100;
            row.valFinal = vf
        },
        setPeriodoPlazo(state, {year, index, value}){
            let row = state.plazosByYear.find(x=>x.year == year).plazos[index];
            row.periodo = parseInt(value)
            
            let vf = Math.round(row.cuota * Math.pow((1+row.interes),(row.periodo/state.general.oneYear)) * 100) / 100;
            row.valFinal = vf
        },
        calculateMagic(state){
            state.plazosByYear = []
            // 180, 360 o 1080
            let start = state.conditions[0].from;
            let end = state.conditions[state.conditions.length-1].to;

            let arrDate = state.general.inicio.split('-');
            
            let startMonth = parseInt(arrDate[1])-1;
            let startDay = parseInt(arrDate[0]);

            let endDate = new Date(end, 11, 31)
            //  console.log(endDate)
            var plazosList = []
            let cont = 0;
            for (let a = start; a < end; a++) {
                // console.log(a)
                // let newYear = [];
                // state.plazos.push(newYear);
                //hay que recorrer esto, por 12 meses, un plazo por cada mes :s
                let plazos = []
                for (let m = 0; m <= 11; m++) {
                    let struct = {
                        interes: state.general.interes,
                        periodo: state.general.periodo,
                        cuota: 0,
                        valFinal: 0,
                        startDate: null,
                        endDate: null
                    }

                    //seteando las fechas
                    struct.startDate = new Date(a, m, startDay);

                    let newDate = new Date(a, m, startDay +state.general.periodo);
                    // console.log(startDate)
                    // newDate.setDate(startDate.getDate() + state.general.periodo);
                    // console.log(newDate)
                    //validar si ya tocan plazos de 1 año
                    // si la fecha fin del plazo se pasa del full stop.
                    if(newDate.getTime() > endDate.getTime()){
                        newDate = new Date(a, m, startDay + state.general.oneYear);
                        struct.interes = state.general.intOne;
                        struct.periodo = state.general.oneYear
                    }


                    //buscar los plazos que venzan despues de la fecha inicio del plazo anterior y antes del inicio de este
                    let accCuota = 0;
                    if(cont > 0){
                        // para eso primero obtengo la fecha inicio del plazo anterior
                        let ffAnterior = plazosList[cont-1].startDate.getTime();
                        // console.log(newDate)
                        // ahora evaluar
                        accCuota = plazosList.filter(x=> x.endDate.getTime() > ffAnterior 
                                                    && x.endDate.getTime() <= struct.startDate.getTime())
                                        .reduce((acc, cur) => acc + cur.valFinal, accCuota)
                        
                    }

                    //formula: Vf = cuota * (1+interes)^periodo
                    let cond = state.conditions.find(x => a >= x.from && a <= x.to);
                    if(cond != undefined){
                        struct.cuota = parseFloat(cond.cuota) +accCuota;
                        // console.log("cuota: %s, interes: %s, periodo: %s, oneyear: %s ",struct.cuota, struct.interes,struct.periodo,state.general.oneYear)
                        let vf = Math.round(struct.cuota * Math.pow((1+struct.interes),(struct.periodo/state.general.oneYear)) * 100) / 100
                        struct.valFinal = vf;
                        // console.log(vf)
                    }

                    struct.endDate = newDate;
                    plazos.push(struct)
                    plazosList.push(struct)
                    // console.log(struct)

                    cont++
                }

                
                let fullRow = {
                    year: a,
                    plazos: plazos
                }
                state.plazosByYear.push(fullRow)
            }
        }
    }
    
});