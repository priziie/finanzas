import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
    conditions: [
      {
        from: 2020,
        to: 2039,
        cuota: 700
      }
    ],
    general: {
      inicio: "05-02-2020",
      interes: 0.0625,
      periodo: 1080,
      intOne: 0.0525,
      oneYear: 360,
      capitalizable: 30,
      intSixMonth: 0.05,
      sixMonths: 180
    },
    plazosList: []
  },
  getters: {
    total(state) {
      if (state.plazosList.length > 0) {
        console.log("ahol");
        console.log(
          state.plazosList
            .filter(p => !p.sumado)
            .reduce((acc, cur) => acc + cur.cuota, 0)
        );
        return state.plazosList
          .filter(p => p.startDate.getTime() == p.endDate.getTime())
          .reduce(
            (acc, cur) => acc + cur.intTotalMes,
            state.plazosList
              .filter(p => !p.sumado)
              .reduce((acc, cur) => acc + cur.cuota, 0)
          );
      }
      return 0;
    }
  },
  actions: {
    setTasaPlazo({ commit, state }, { index, value }) {
      let row = state.plazosList[index];
      row.interes = parseFloat(value);
      // row.changed = true
      commit("recalculate", { index: index });
    },
    setCuotaPlazo({ commit, state }, { index, value }) {
      let row = state.plazosList[index];
      //   row.cuota = parseFloat(value);
      row.changeVal = parseFloat(value);

      commit("recalculate", { index: index });
    },
    setPeriodoPlazo({ commit, state }, { index, value }) {
      let row = state.plazosList[index];
      row.periodo = parseInt(value);
      // row.changed = true

      row.endDate = new Date(
        row.startDate.getFullYear(),
        row.startDate.getMonth(),
        row.startDate.getDate() + row.periodo
      );

      commit("recalculate", { index: index });
    }
  },
  mutations: {
    addEmptyFilter(state) {
      var emptyRow = {
        from: null,
        to: null,
        cuota: null
      };
      state.conditions.push(emptyRow);
    },
    removeFilter(state, index) {
      state.conditions.splice(index, 1);
    },
    updateFilterFrom(state, { index, value }) {
      state.conditions[index].from = value;
    },
    updateFilterTo(state, { index, value }) {
      state.conditions[index].to = value;
    },
    updateFilterCuota(state, { index, value }) {
      state.conditions[index].cuota = value;
    },
    setInteres(state, value) {
      state.general.interes = value;
    },
    setIntUno(state, value) {
      state.general.intOne = value;
    },
    setPeriodo(state, value) {
      state.general.periodo = value;
    },
    setPerUno(state, value) {
      state.general.oneYear = value;
    },
    setInicio(state, value) {
      state.general.inicio = value;
    },
    setCapitalizable(state, value) {
      state.general.capitalizable = value;
    },
    recalculate(state, { index }) {
      // let row = state.plazosByYear.find(x=>x.year == year).plazos[index];
      // let vf = Math.round(struct.cuota * (1+(struct.interes/daysYear))*(state.general.capitalizable) * 100) / 100
      // row.valFinal = vf
      //ahora la magia..
      // let cont = 0;
      // var plazosList = []
      // state.plazosByYear.forEach(py => {
      state.plazosList.forEach((p, i) => {
        // let accCuota = 0;
        // plazosList.push(p)
        console.log(p.startDate);
        p.sumado = false;
        p.intMensual = 0;

        //buscar los plazos que venzan despues de la fecha inicio del plazo anterior y antes del inicio de este
        let accCuota = 0;
        if (i > 0) {
          // para eso primero obtengo la fecha inicio del plazo anterior
          let ffAnterior = state.plazosList[i - 1].startDate.getTime();
          // console.log(newDate)
          // ahora evaluar
          var newArray = state.plazosList.filter(
            x =>
              x.endDate.getTime() > ffAnterior &&
              x.endDate.getTime() <= p.startDate.getTime() &&
              x.startDate.getTime() != x.endDate.getTime()
          );
          console.log(newArray);
          newArray.forEach(x => (x.sumado = true));

          accCuota = newArray.reduce((acc, cur) => acc + cur.cuota, accCuota);

          accCuota += Math.round(state.plazosList[i - 1].intTotalMes);
        }

        //formula: Vf = cuota * (1+interes mensual)*periodo mensual
        let isBisiesto =
          p.year % 400 === 0 || (p.year % 100 !== 0 && p.year % 4 === 0);
        let daysYear = isBisiesto ? 366 : 365;
        if (p.changeVal != 0) {
          p.cuota = p.changeVal + accCuota;
        } else {
          let cond = state.conditions.find(
            x => p.year >= x.from && p.year <= x.to
          );
          if (cond != undefined) {
            p.cuota = parseFloat(cond.cuota) + accCuota;
          } else p.cuota = 0;
        }
        // console.log("cuota: %s, interes: %s, periodo: %s, oneyear: %s ",p.cuota, p.interes,p.periodo,state.general.oneYear)
        let intMensual =
          Math.round(
            p.cuota * (p.interes / daysYear) * state.general.capitalizable * 100
          ) / 100;
        p.intMensual = intMensual;
        // p.valFinal = (intMensual*12)+p.cuota

        //obtener todos los plazos que venzan en el que la fecha de inicio de este plazo esté entre las fechas del plazo
        let startMonthDate = new Date(p.year, p.startDate.getMonth(), 1);
        let intTotalMensual = state.plazosList
          .filter(
            x =>
              startMonthDate.getTime() > x.startDate.getTime() &&
              startMonthDate.getTime() <= x.endDate.getTime()
          )
          .reduce((acc, cur) => acc + cur.intMensual, 0);

        p.intTotalMes =
          Math.round((intTotalMensual + p.intMensual) * 100) / 100;

        // console.log(vf)
        // cont++
      });
      // });
    },
    calculateMagic(state) {
      // state.plazosByYear = []
      // 180, 360 o 1080
      let start = state.conditions[0].from;
      let end = state.conditions[state.conditions.length - 1].to;

      let arrDate = state.general.inicio.split("-");

      let startMonth = parseInt(arrDate[1]) - 1;
      let startDay = parseInt(arrDate[0]);

      let endDate = new Date(end, 11, 31);
      console.log(endDate);
      state.plazosList = [];
      let cont = 0;
      for (let a = start; a <= end; a++) {
        // console.log(a)
        // let newYear = [];
        // state.plazos.push(newYear);
        //hay que recorrer esto, por 12 meses, un plazo por cada mes :s
        // let plazos = []
        let mIni = a > start ? 0 : startMonth;
        for (let m = mIni; m <= 11; m++) {
          let struct = {
            interes: state.general.interes,
            periodo: state.general.periodo,
            intMensual: 0,
            intTotalMes: 0,
            cuota: 0,
            valFinal: 0,
            startDate: null,
            endDate: null,
            sumado: false,
            year: a,
            changeVal: 0
          };

          //seteando las fechas
          struct.startDate = new Date(a, m, startDay);

          let newDate = new Date(a, m, startDay + state.general.periodo);
          if (newDate.getTime() > endDate.getTime()) {
            newDate = new Date(a, m, startDay + state.general.oneYear);
            struct.interes = state.general.intOne;
            struct.periodo = state.general.oneYear;
            // console.log("1, ",newDate, " new: ",endDate)
            if (newDate.getTime() > endDate.getTime()) {
              newDate = new Date(a, m, startDay + state.general.sixMonths);
              struct.interes = state.general.intSixMonth;
              struct.periodo = state.general.sixMonths;
              // console.log("2, ",newDate)
              if (newDate.getTime() > endDate.getTime()) {
                struct.interes = 0;
                struct.periodo = 0;
                newDate = new Date(a, m, startDay);
                // console.log("3, ",newDate)
              }
            }
          }

          //buscar los plazos que venzan despues de la fecha inicio del plazo anterior y antes del inicio de este
          let accCuota = 0;
          if (cont > 0) {
            // para eso primero obtengo la fecha inicio del plazo anterior
            let ffAnterior = state.plazosList[cont - 1].startDate.getTime();
            // console.log(newDate)
            // ahora evaluar
            var newArray = state.plazosList.filter(
              x =>
                x.endDate.getTime() > ffAnterior &&
                x.endDate.getTime() <= struct.startDate.getTime()
            );
            newArray.forEach(x => (x.sumado = true));

            accCuota = newArray.reduce((acc, cur) => acc + cur.cuota, accCuota);

            accCuota += Math.round(state.plazosList[cont - 1].intTotalMes);
          }

          //formula: Vf = cuota * (1+interes mensual)*periodo mensual
          let isBisiesto = a % 400 === 0 || (a % 100 !== 0 && a % 4 === 0);
          let daysYear = isBisiesto ? 366 : 365;
          let cond = state.conditions.find(x => a >= x.from && a <= x.to);
          if (cond != undefined) {
            // console.log("este: ",struct.intTotalMes, " anterior: ", (cont > 0) ? state.plazosList[cont-1].intTotalMes : 0)
            struct.cuota = parseFloat(cond.cuota) + accCuota;
            struct.changeVal = Math.round(cond.cuota);
            // console.log("cuota: %s, interes: %s, periodo: %s, oneyear: %s ",struct.cuota, struct.interes,struct.periodo,state.general.oneYear)
            let intMensual =
              Math.round(
                struct.cuota *
                  (struct.interes / daysYear) *
                  state.general.capitalizable *
                  100
              ) / 100;
            struct.intMensual = intMensual;
            // struct.valFinal = (intMensual*12)+struct.cuota;
            // console.log(vf)
          }

          //obtener todos los plazos que venzan en el que la fecha de inicio de este plazo esté entre las fechas del plazo
          let startMonthDate = new Date(a, m, 1);
          console.log(startMonthDate);
          let intTotalMensual = state.plazosList
            .filter(
              x =>
                startMonthDate.getTime() > x.startDate.getTime() &&
                startMonthDate.getTime() <= x.endDate.getTime()
            )
            .reduce((acc, cur) => acc + cur.intMensual, 0);

          struct.intTotalMes =
            Math.round((intTotalMensual + struct.intMensual) * 100) / 100;

          struct.endDate = newDate;
          // plazos.push(struct)
          state.plazosList.push(struct);
          // console.log(struct)

          cont++;
        }

        // let fullRow = {
        //     year: a,
        //     plazos: plazos
        // }
        // state.plazosByYear.push(fullRow)
      }
    },
    centralLogic() {}
  }
});
