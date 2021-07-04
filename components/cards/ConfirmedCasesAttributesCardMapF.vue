<template>
  <v-col cols="12" md="12" class="DataCard">
    <div>
      <MapView
        id="attributes-of-confirmed-cases-city"
        :title="$t('陽性者属性(直近２週間)')"
        :title-id="'attributes-of-confirmed-cases-mapf'"
        :the-data="theData"
        :date="graphData.patients.date"
        :info="sumInfoOfPatients"
        :url="
          'https://www.pref.fukushima.lg.jp/sec/21045c/fukushima-hasseijyoukyou.html'
        "
      />
    </div>
  </v-col>
</template>

<script lang="ts">
import Vue from 'vue'
import Data from '@/data/data.json'
import formatGraph from '@/utils/formatGraph'
import formatTable from '@/utils/formatTableCity'
// import DataViewBasicInfoPanel from '@/components/DataViewBasicInfoPanel.vue'
// import MapView from '@/components/DataXyMapCityF.vue'
import MapView from '@/components/DataXyMapCityFlf.vue'

export default Vue.extend({
  components: {
    MapView
  },
  props: {
    graphData: {
      type: Object,
      required: false,
      default: Data
    }
  },
  data() {
    // 継承用にobject copy
    const theData = {}
    Object.assign(theData, this.graphData)
    // const theData =Vue.util.extend ({}, this.graphData);
    // 感染者数グラフ
    const patientsGraph = formatGraph(this.graphData.patients_summary.data)
    // 感染者数
    const patientsTable = formatTable(this.graphData.patients.data)

    const sumInfoOfPatients = {
      lText: patientsGraph[
        patientsGraph.length - 1
      ].cumulative.toLocaleString(),
      sText: this.$t('{date}の累計', {
        date: patientsGraph[patientsGraph.length - 1].label
      }),
      // ladText: '',
      unit: this.$t('人')
    }

    const data = {
      theData,
      patientsGraph,
      patientsTable,
      sumInfoOfPatients
    }
    return data
  },
  mounted() {
    // 継承用にobject copy
    this.theData = {}
    Object.assign(this.theData, this.graphData)
    // this.theData = Vue.util.extend({}, this.graphData);
    // 感染者数グラフ
    this.patientsGraph = formatGraph(this.graphData.patients_summary.data)
    // 感染者数
    this.patientsTable = formatTable(this.graphData.patients.data)

    let totalPersons = 0
    for (const row of this.patientsTable.datasets) {
      totalPersons += Number(row['累計'])
    }
    this.sumInfoOfPatients = {
      /* yesii
      lText: this.patientsGraph[
        this.patientsGraph.length - 1
      ].cumulative.toLocaleString(),
      */
      lText: String(totalPersons).toLocaleString(),
      sText: this.$t('{date}の累計', {
        date: this.patientsGraph[this.patientsGraph.length - 1].label
      }),
      unit: this.$t('人')
    }
  }
})
</script>
