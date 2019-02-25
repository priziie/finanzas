import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export const store = new Vuex.Store({
    state: {
        conditions: [{
            from: 2020,
            to: 2023,
            cuota: 250
        },{
            from: 2024,
            to: 2040,
            cuota: 300
        }],
        general:{
            inicio: '15-02-2020',
            interes: 0.0625,
            periodo: 1080,
            intOne: 0.0525,
            oneYear: 360,
            monthDays: 30
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
    actions:{
        setTasaPlazo({commit,state}, {year, index, value}){
            let row = state.plazosByYear.find(x=>x.year == year).plazos[index];
            row.interes = parseFloat(value)
            commit('recalculate', {year:year, index: index});
        },
        setCuotaPlazo({commit,state}, {year, index, value}){
            let row = state.plazosByYear.find(x=>x.year == year).plazos[index];
            row.cuota = parseFloat(value)
            
            commit('recalculate', {year:year, index: index});
        },
        setPeriodoPlazo({commit,state}, {year, index, value}){
            let row = state.plazosByYear.find(x=>x.year == year).plazos[index];
            row.periodo = parseInt(value);
            commit('recalculate', {year:year, index: index});
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
        setInicio(state, value){
            state.general.inicio = value;
        },
        recalculate(state,{year, index}){
            // let row = state.plazosByYear.find(x=>x.year == year).plazos[index];
            // let vf = Math.round(struct.cuota * (1+(struct.interes/daysYear))*(state.general.monthDays) * 100) / 100
            // row.valFinal = vf
            //ahora la magia..
            let cont = 0;
            var plazosList = []
            state.plazosByYear.forEach(py => {
                py.plazos.forEach((p, i)=>{
                    let accCuota = 0;
                    plazosList.push(p)
                    if(cont > 0){
                        // para eso primero obtengo la fecha inicio del plazo anterior
                        let ffAnterior = plazosList[cont-1].startDate.getTime();
                        // console.log(newDate)
                        // ahora evaluar
                        accCuota = plazosList.filter(x=> x.endDate.getTime() > ffAnterior 
                                                    && x.endDate.getTime() <= p.startDate.getTime())
                                        .reduce((acc, cur) => acc + cur.valFinal, accCuota)
                        
                    }

                    //formula: Vf = cuota * (1+interes mensual)*periodo mensual
                    let isBisiesto = py.year % 400 === 0 || (py.year % 100 !== 0 && py.year % 4 === 0);
                    let daysYear = isBisiesto ? 366 : 365;
                    if(py.year == year && index == i){
                        p.cuota += accCuota
                    }
                    else{
                        let cond = state.conditions.find(x => py.year >= x.from && py.year <= x.to);
                        if(cond != undefined){
                            p.cuota = parseFloat(cond.cuota) +accCuota;
                        }
                        else 
                            p.cuota = 0
                    }
                    // console.log("cuota: %s, interes: %s, periodo: %s, oneyear: %s ",p.cuota, p.interes,p.periodo,state.general.oneYear)
                    let intMensual = Math.round((p.cuota * (p.interes/daysYear)*state.general.monthDays) * 100) / 100
                    p.intMensual = intMensual;
                    p.valFinal = (intMensual*12)+p.cuota
                    // console.log(vf)
                    cont++
                })
            });
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
                let mIni = (a > start) ? 0 : startMonth-1;
                for (let m = mIni; m <= 11; m++) {
                    let struct = {
                        interes: state.general.interes,
                        periodo: state.general.periodo,
                        intMensual: 0,
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

                    //formula: Vf = cuota * (1+interes mensual)*periodo mensual
                    let isBisiesto = a % 400 === 0 || (a % 100 !== 0 && a % 4 === 0);
                    let daysYear = isBisiesto ? 366 : 365;
                    let cond = state.conditions.find(x => a >= x.from && a <= x.to);
                    if(cond != undefined){
                        struct.cuota = parseFloat(cond.cuota) +accCuota;
                        // console.log("cuota: %s, interes: %s, periodo: %s, oneyear: %s ",struct.cuota, struct.interes,struct.periodo,state.general.oneYear)
                        let intMensual = Math.round((struct.cuota * (struct.interes/daysYear)*state.general.monthDays) * 100) / 100
                        struct.intMensual = intMensual;
                        struct.valFinal = (intMensual*12)+struct.cuota;
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