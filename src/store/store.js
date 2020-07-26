import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
    conditions: [
      {
        from: 2020,
        to: 2039,
        cantidad: 700
      }
    ],
    general: {
      inicio: '05-02-2020',
      interes: 0.0625,
      periodo: 1080,
      intOne: 0.0525,
      oneYear: 360,
      capitalizable: 30,
      intSixMonth: 0.05,
      sixMonths: 180
    },
    plazosList: [],
    intereses: []
  },
  getters: {
    total(state) {
      if (state.plazosList.length > 0) {
        // console.log('ahol');
        // console.log(
        //   state.plazosList
        //     .filter(p => !p.sumado)
        //     .reduce((acc, cur) => acc + cur.cantidad, 0)
        // );
        return state.plazosList
          .filter(p => p.startDate.getTime() == p.endDate.getTime())
          .reduce(
            (acc, cur) => acc + cur.intTotalMes,
            state.plazosList
              .filter(p => !p.sumado)
              .reduce((acc, cur) => acc + cur.cantidad, 0)
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
      commit('recalculate', { index: index });
    },
    setCuotaPlazo({ commit, state }, { index, value }) {
      let row = state.plazosList[index];
      row.changeVal = parseFloat(value);

      commit('recalculate', { index: index });
    },
    setCuotaPlazo({ commit, state }, { index, value }) {
      let row = state.plazosList[index];
      row.changeVal = parseFloat(value);

      commit('recalculate', { index: index });
    },
    setCantidadPlazo({ commit, state }, { index, value }) {
      let row = state.plazosList[index];
      row.changeCantidad = parseFloat(value);

      commit('recalculate', { index: index });
    },
    remove({ commit, state }, { index }) {
      state.plazosList = state.plazosList.filter((x, i) => index != i);

      commit('recalculate', { index: index });
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

      commit('recalculate', { index: index });
    },
    setStartDate({ commit, state }, { index, value }) {
      let row = state.plazosList[index];

      const valArray = value.split('/');

      row.startDate = new Date(
        valArray[2],
        parseInt(valArray[1]) - 1,
        valArray[0]
      );

      row.endDate = new Date(
        row.startDate.getFullYear(),
        row.startDate.getMonth(),
        row.startDate.getDate() + row.periodo
      );

      commit('recalculate', { index: index });
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
      state.conditions[index].cantidad = value;
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
      state.intereses = [];
      state.plazosList.forEach((plazoInfo, i) => {
        plazoInfo.sumado = false;
        plazoInfo.intMensual = 0;

        centralLogic(plazoInfo, state, i);
      });
      // });
    },
    calculateMagic(state) {
      // state.plazosByYear = []
      // 180, 360 o 1080
      let startYear = state.conditions[0].from;
      let endYear = state.conditions[state.conditions.length - 1].to;

      let initDate = state.general.inicio.split('-');

      let startMonth = parseInt(initDate[1]) - 1;
      let startDay = parseInt(initDate[0]);

      let endDate = new Date(endYear, 11, 31);
      //  console.log(endDate)
      state.plazosList = [];
      let cont = 0;
      for (let a = startYear; a <= endYear; a++) {
        // console.log(a)
        // let newYear = [];
        // state.plazos.push(newYear);
        //hay que recorrer esto, por 12 meses, un plazo por cada mes :s
        //el primer año se comienza en el mes de inicio indicado
        let mIni = a > startYear ? 0 : startMonth;
        for (let m = mIni; m <= 11; m++) {
          let plazoInfo = {
            interes: state.general.interes,
            periodo: state.general.periodo,
            intMensual: 0,
            intTotalMes: 0,
            cantidad: 0,
            startDate: new Date(a, m, startDay),
            endDate: null,
            sumado: false,
            year: a
          };

          let endDatePlazo = new Date(a, m, startDay + state.general.periodo);
          //juego de ir cambiando a menor tiempo los plazos
          if (endDatePlazo.getTime() > endDate.getTime()) {
            endDatePlazo = new Date(a, m, startDay + state.general.oneYear);
            plazoInfo.interes = state.general.intOne;
            plazoInfo.periodo = state.general.oneYear;
            // console.log("1, ",endDatePlazo, " new: ",endDate)
            if (endDatePlazo.getTime() > endDate.getTime()) {
              endDatePlazo = new Date(a, m, startDay + state.general.sixMonths);
              plazoInfo.interes = state.general.intSixMonth;
              plazoInfo.periodo = state.general.sixMonths;
              // console.log("2, ",endDatePlazo)
              if (endDatePlazo.getTime() > endDate.getTime()) {
                plazoInfo.interes = 0;
                plazoInfo.periodo = 0;
                endDatePlazo = new Date(a, m, startDay);
                // console.log("3, ",endDatePlazo)
              }
            }
          }
          plazoInfo.endDate = endDatePlazo;

          //   console.log(plazoInfo);
          centralLogic(plazoInfo, state, cont);
          state.plazosList.push(plazoInfo);

          cont++;
        }
      }
    }
  }
});

const centralLogic = (plazoInfo, state, plazo) => {
  //obtengo los plazos que ya vencieron.
  //buscar los plazos que venzan despues de la fecha inicio del plazo anterior
  //y antes del inicio de este
  let accCuota = 0;
  if (plazo > 0) {
    // para eso primero obtengo la fecha inicio del plazo anterior
    const startDateAnterior = state.plazosList[plazo - 1].startDate.getTime();
    // ahora evaluar
    accCuota = state.plazosList
      .filter(
        x =>
          x.endDate.getTime() > startDateAnterior &&
          x.endDate.getTime() <= plazoInfo.startDate.getTime() &&
          x.startDate.getTime() != x.endDate.getTime()
      )
      .map(x => {
        x.sumado = true;
        return x;
      })
      .reduce((acc, cur) => acc + cur.cantidad, accCuota);

    // accCuota += Math.round(state.plazosList[plazo - 1].intTotalMes);
  }

  //   console.log(state.intereses);
  const intTotalMensual = state.intereses
    .filter(x => !x.sumado)
    .filter(x => x.date.getTime() <= plazoInfo.startDate.getTime())
    .map(x => {
      x.sumado = true;
      return x;
    })
    .reduce((acc, cur) => acc + cur.cantidad, 0);
  //   console.log(intTotalMensual);
  accCuota += Math.round(intTotalMensual);

  let isBisiesto =
    plazoInfo.year % 400 === 0 ||
    (plazoInfo.year % 100 !== 0 && plazoInfo.year % 4 === 0);
  let daysYear = isBisiesto ? 366 : 365;
  if (plazoInfo.changeVal) {
    plazoInfo.cantidad = plazoInfo.changeVal + accCuota;
  } else if (plazoInfo.changeCantidad) {
    plazoInfo.cantidad = plazoInfo.changeCantidad;
  } else {
    const cuotaActual = state.conditions.find(
      x => plazoInfo.year >= x.from && plazoInfo.year <= x.to
    );
    if (cuotaActual) {
      // console.log("este: ",plazoInfo.intTotalMes, " anterior: ", (plazo > 0) ? state.plazosList[plazo-1].intTotalMes : 0)
      //   console.log('accCuota', accCuota);
      //   plazoInfo.changeVal = Math.round(cuotaActual.cantidad);
      plazoInfo.cantidad = parseFloat(cuotaActual.cantidad) + accCuota;
    } else plazoInfo.cantidad = 0;
  }

  //formula: Vf = cuota * (1+interes mensual)*periodo mensual
  const intMensual =
    Math.round(
      plazoInfo.cantidad *
        (plazoInfo.interes / daysYear) *
        state.general.capitalizable *
        100
    ) / 100;
  plazoInfo.intMensual = intMensual;

  plazoInfo.intTotalMes =
    Math.round((intTotalMensual + plazoInfo.intMensual) * 100) / 100;

  //crear todos los intereses
  let nextInteresDate = new Date(
    plazoInfo.startDate.getFullYear(),
    plazoInfo.startDate.getMonth(),
    plazoInfo.startDate.getDate() + state.general.capitalizable
  );
  while (nextInteresDate.getTime() < plazoInfo.endDate.getTime()) {
    const intInfo = {
      cantidad: plazoInfo.intMensual,
      date: new Date(
        nextInteresDate.getFullYear(),
        nextInteresDate.getMonth(),
        nextInteresDate.getDate()
      ),
      sumado: false
    };
    state.intereses.push(intInfo);

    nextInteresDate.setDate(
      nextInteresDate.getDate() + state.general.capitalizable
    );
  }
};
