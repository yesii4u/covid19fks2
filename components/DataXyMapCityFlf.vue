<template>
  <div class="MapCity">
    <div class="MapCity-Inner">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
      />
      <div class="MapCity-Header">
        <span class="MapCity-Title">
          {{ $t('陽性者属性(直近２週間)') }}
        </span>
        <span class="MapCity-DataInfo">
          <span class="MapCity-DataInfo-summary">
            <small class="MapCity-DataInfo-summary-date"
              >{{ lastUpdate }}{{ $t('の累計') }}</small
            >
            <small class="MapCity-DataInfo-summary-unit"
              >{{ info.lText }}{{ $t('人') }}</small
            >
          </span>
        </span>
      </div>

      <!--no-ssr    -->
      <div id="mapapp" class="MapCity-Map" />
      <!--/no-ssr   -->

      <div class="MapCity-Footer">
        <div class="Footer-Left">
          <div>
            <a class="Permalink" :href="permalink()">
              <time :datetime="formattedDate">
                {{ $t('{dateD} 更新', { dateD }) }}
              </time>
            </a>
          </div>
          <div class="MapCity-Table">
            <h4>{{ $t('その他未分類') }}</h4>
            <table class="MapCity-Table-Style">
              <!--tr>
                <th>区分</th>
                <th>陽性者数</th>
              </tr  -->
              <tr>
                <td>{{ $t('県外') }}</td>
                <td>{{ totalPerson }}人</td>
              </tr>
              <!--tr v-for="(value, key) in remainderData" :key="key">
                <td>{{ value.name }}</td>
                <td>{{ value.personCount }}人</td>
              </tr    -->
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// memo
// mapviewとして分割すべきかされど[slot]化は見通しを悪くする気がするのだが
import Vue from 'vue'
import { MetaInfo } from 'vue-meta'
import dayjs from 'dayjs'
import { convertDatetimeToISO8601Format } from '@/utils/formatDate'
// import {LMap, LTileLayer, LMarker, LCircleMarker, LIcon} from 'vue2-leaflet';
import 'leaflet/dist/leaflet.css'
// import  L from 'leaflet'

// import axios from 'axios'
// import Data from '@/data/data.json'
import formatGraph from '@/utils/formatGraph'
import formatTable from '@/utils/formatTableCity'
import MapGeojson from '@/data/fukushima_map.geojson.json'
import MapCity from '@/data/mapcity.json'
// mapgeojsonは重い
// async()にしてもこのステージでは大差ない...

export default Vue.extend({
  components: {},
  props: {
    title: {
      type: String,
      default: ''
    },
    titleId: {
      type: String,
      default: ''
    },
    theData: {
      type: Object,
      default: () => {}
    },
    date: {
      type: String,
      default: ''
    },
    info: {
      type: Object,
      default: () => {}
    },
    url: {
      type: String,
      default: ''
    }
  },
  data() {
    // object copy
    const theDataD = {}
    Object.assign(theDataD, this.theData)
    // 陽性者数グラフ
    const patientsGraphData = formatGraph(this.theData.patients_summary.data)
    // 陽性者数
    const patientsTableData = formatTable(this.theData.patients.data)
    // 直近の公表日の取得
    /* notuse
    const lad = new Date(
      //this.theData.patients_summary.data[this.theData.patients_summary.data.length - 1]['日付']
      this.theData.patients_summary.data[this.theData.patients_summary.data.length - 1].label
    )
    */
    const imageboundsD = [
      [37.051277285581236, 141.31341102527992],
      [37.504796327472725, 141.56001327561324]
    ]
    const dataObject: any = {
      tile: {
        url: 'https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png',
        attribution: `<a href='https://maps.gsi.go.jp/development/ichiran.html'>国土地理院</a>(ズームレベル2～8:Shoreline data is derived from: United States. National Imagery and Mapping Agency. "Vector Map Level 0 (VMAP0)." Bethesda, MD: Denver, CO: The Agency; USGS Information Services, 1997.), <a href='http://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N03-v2_3.html'>行政区域データ出典「国土数値情報」</a>`
      },
      mapOptions: {
        zoom: 9,
        minZoom: 2,
        maxZoom: 18,
        center: [37.40056, 140.35972]
        // pCanvas: true
      },
      customIcon: {
        iconUrl: '/images/blue01.png',
        iconSize: [50, 75],
        iconAnchor: [20, 30],
        popupAnchor: [-5, -50]
      },
      customtext: 'covid19',
      iUrl: '/images/blue01.png',
      iSize: 50,
      geojson: MapGeojson,
      geojsonOptions: {},
      marker: [],
      markerbase: 80, // 0.5,   //120,
      markercolor: 'blue',
      weight: 2.0,
      markercenter: MapCity,
      lastUpdate: '',
      dateD: this.date,
      totalPersons: '',
      remainderData: [],
      theDataD,
      patientsGraph: patientsGraphData,
      patientsTable: patientsTableData,
      imageurl: '/images/blue01.png',
      imagebounds: imageboundsD
    }
    return dataObject
    // dateD: lad
  },
  computed: {
    formattedDate(): string {
      return convertDatetimeToISO8601Format(this.date)
    },
    totalPerson() {
      let totalPerson = 0
      for (let i = 0; i < this.remainderData.length; i++) {
        totalPerson += this.remainderData[i].personCount
      }
      return totalPerson
    },
    dynamicSize(): any {
      // return ([this.iSize, this.iSize * 1.6]);
      return [50, 75]
    },
    dynamicAnchor(): any {
      return [this.iSize / 2, this.iSize * 1.15]
      // return ([0, 0]);
    }
  },
  mounted() {
    // if (process.client) {
    // データの準備
    // require('leaflet/dist/leaflet.css');
    const L = require('leaflet')

    // <l-map
    // add.map: centerを中心にマップ描写
    // let mpoint = [items[mcenter].緯度,items[mcenter].経度];
    const map = L.map('mapapp', {
      zoom: this.mapOptions.zoom,
      minZoom: this.mapOptions.minZoom,
      maxZoom: this.mapOptions.maxZoom,
      center: this.mapOptions.center
    })

    // <l-tile-layer
    // add.tile
    const tileLayer = L.tileLayer(this.tile.url, {
      attribution: this.tile.attribution,
      zoom: this.mapOptions.zoom,
      minZoom: this.mapOptions.minZoom,
      maxZoom: this.mapOptions.maxZoom
    })
    tileLayer.addTo(map)

    // object copy
    // this.theDataD ={}
    // Object.assign(this.theDataD, this.theData)
    // const theDataMap = Vue.util.extend({}, this.theData);
    // 陽性者数グラフ
    this.patientsGraphData = formatGraph(this.theData.patients_summary.data)
    // 陽性者数
    this.patientsTableData = formatTable(this.theData.patients.data)
    // 陽性患者の属性 ヘッダー翻訳
    for (const header of this.patientsTable.headers) {
      header.text = this.$t(header.value)
    }
    // 陽性患者の属性 中身の翻訳
    for (const row of this.patientsTable.datasets) {
      row['公表日'] = this.$t(row['公表日'])
      row['居住地'] = this.$t(row['居住地'])
      row['累計'] = this.$t(row['累計'])
    }

    // Geoデータの準備
    const gCityName = ''
    // let theinfo: any
    const gNumStr = ''
    const gmaxInfectionPersonCount = 0 // eslint-disable-line no-unused-vars
    // <l-marker
    // eslint-disable-line no-unused-vars
    this.lastUpdate = this.getLastUpdate()
    this.setInfectionPersonCountData()

    // Geoデータの作図

    // <l-geo-json
    // add.geoJson
    // add.style-Events
    // let geojsonLayer = L.geoJson(this.geojson, {    //returnはlayerである
    L.geoJson(this.geojson, {
      // returnはlayerである
      style: this.style,
      onEachFeature: this.onEachFeature
    }).addTo(map)
    // map.fitBounds(geojsonL1.getBounds());       //zoomに相反

    // add.Legend
    // this.makeLabel(map, L)
    this.makeLegend(map, L)

    // <l-popup
    // add.popup
    this.makePopup(map, L, this.marker)

    // <l-circle
    // add.circle
  },
  methods: {
    permalink(host: boolean = false, embed: boolean = false) {
      let permalink = '/cards/' + this.titleId
      if (embed) {
        permalink = permalink + '?embed=true'
      }
      permalink = this.localePath(permalink)

      if (host) {
        permalink = location.protocol + '//' + location.host + permalink
      }
      return permalink
    },
    getColor(d: number) {
      return d > 85
        ? '#800026'
        : d > 75
        ? '#BD0026'
        : d > 65
        ? '#E31A1C'
        : d > 50
        ? '#FC4E2A'
        : d > 35
        ? '#FD8D3C'
        : d > 20
        ? '#FEB24C'
        : d > 10
        ? '#FED976'
        : '#FFEDA0'
    },
    highlightFeature(e: any) {
      const layer = e.target
      // this.theinfo = this.L.control();
      layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
      })

      // this.theinfo.update(layer.feature.properties)
      // if (!this.L.Browser.ie && !this.L.Browser.opera) {
      layer.bringToFront()
      // }
    },
    resetHighlight(e: any) {
      const layer = e.target
      // this.theinfo = this.L.control();
      layer.setStyle({
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
      })

      // this.theinfo.update()
      // this.geojsonLayer.resetStyle(e.target);
    },
    /*
    zoomToFeature: function(e: any) {
      const layer = e.target;
      //this.map.fitBounds(e.target.getBounds());
    },
    */
    makeLegend(map: any, L: any) {
      const legend = L.control({ position: 'bottomright' })

      legend.onAdd = () => {
        const div = L.DomUtil.create('div', 'legend')
        const grades = [0, 10, 20, 35, 50, 65, 75, 85]
        // let labels = []
        let from, to
        const labels = [
          '0-10  %',
          '10-20',
          '20-35',
          '35-50',
          '50-65',
          '65-75',
          '75-85',
          '85 >'
        ]

        div.innerHTML = '<div><b>陽性者数比率</b></div>'
        for (let i = 0; i < grades.length; i++) {
          div.innerHTML +=
            '<i style="background:' +
            this.getColor(grades[i]) +
            '">&nbsp;&nbsp;</i>&nbsp;&nbsp; ' +
            labels[i] +
            '</br>'
        }
        return div
      }
      legend.addTo(map)
    },
    getLastUpdate() {
      this.sumInfoOfPatients = {
        lText: this.patientsGraph[
          this.patientsGraph.length - 1
        ].cumulative.toLocaleString(),
        sText: this.$t('{date}の累計', {
          date: this.patientsGraph[this.patientsGraph.length - 1].label
        }),
        unit: this.$t('人')
      }

      return '2020/01/10' // dummy
    },
    getInfectionPersonCount() {
      let dataDate = '01/10'
      let mapCityNameDate = '01/10'
      this.totalPersons = 0
      for (const row of this.patientsTable.datasets) {
        row['公表日'] = this.$t(row['公表日'])
        row['居住地'] = this.$t(row['居住地'])
        row['累計'] = this.$t(row['累計'])
        this.totalPersons += Number(row['累計'])

        mapCityNameDate = row['公表日']
        if (dayjs(dataDate).isAfter(dayjs(mapCityNameDate))) {
          this.lastUpdate = dataDate
        } else {
          this.lastUpdate = mapCityNameDate
          dataDate = mapCityNameDate
        }
      }

      return 1 // dummy
    },
    setInfectionPersonCountData() {
      // データの取得
      this.getInfectionPersonCount()
      this.gmaxInfectionPersonCount = 0
      for (const row of this.patientsTable.datasets) {
        row['公表日'] = this.$t(row['公表日'])
        row['居住地'] = this.$t(row['居住地'])
        row['累計'] = this.$t(row['累計'])

        if (this.gmaxInfectionPersonCount < Number(row['累計'])) {
          this.gmaxInfectionPersonCount = Number(row['累計'])
        }
        this.remainderData.push({
          name: row['居住地'],
          personCount: Number(row['累計'])
        })
      }
    },
    onEachFeature(feature: any, layer: any) {
      // 地図にデータを設定する:popup(features)
      // (01)
      let idx = 0
      // geojsonデータの同一行政区名重複を避ける
      layer.bindTooltip(
        `<h4>${
          feature.properties.N03_003 ? `${feature.properties.N03_003} ` : ''
        }
        ${feature.properties.N03_004}</h4><h5>陽性者: ${
          // (idx =(this.patientsTable.datasets.findindex((v: any) => v.居住地 === feature.properties.N03_004)))>=0    //!!!error
          (idx = this.patientsTable.datasets.findIndex(
            (v: any) => v.居住地 === feature.properties.N03_004
          )) >= 0
            ? (this.gNumStr = `${this.patientsTable.datasets[idx].累計}人`)
            : (this.gNumStr = 'なし')
        }</h5>`
      )

      // Event設定
      layer.on({
        mouseover: this.highlightFeature,
        mouseout: this.resetHighlight
        // click: this.zoomToFeature
      })
    },
    style(feature: any) {
      // remainderData調整
      this.remainderData = this.remainderData.filter(
        (data: any) => data.name !== feature.properties.N03_004
      )

      // 地図にデータを設定する:style
      // (02)
      // marker設定
      // 重複はしない
      if (this.gCityName !== feature.properties.N03_004) {
        // popup-contents
        let item = '' // contents
        let item2 = 0 // pesons-count
        let idx = 0 // findindex
        let lat1 = ''
        let lng1 = ''
        // 地図の地名が陽性者居住地に出現するか
        if (
          (idx = this.patientsTable.datasets.findIndex(
            (v: any) => v.居住地 === feature.properties.N03_004
          )) >= 0
        ) {
          item =
            feature.properties.N03_004 +
            ' :\n ' +
            this.patientsTable.datasets[idx].累計 +
            '人'
          item2 = this.patientsTable.datasets[idx].累計
        } else {
          item = feature.properties.N03_004 + ' :\n ' + 'なし'
          item2 = 0
        }
        if (item2 > 0) {
          // popupあり
          // 陽性者居住地が[mapcenter:行政施設名]に存在するか
          if (
            (idx = this.markercenter.findIndex(
              (v: any) => v.居住地 === feature.properties.N03_004
            )) >= 0
          ) {
            lat1 = this.markercenter[idx].緯度
            lng1 = this.markercenter[idx].経度
          } else {
            // 陽性者なし or行政施設名に不一致
            lat1 = feature.geometry.coordinates[0][0][1] // 緯度
            lng1 = feature.geometry.coordinates[0][0][0] // 経度
          }
          // 県外陽性者は地図のfeatureに出現しないので無視される
          // popupmarker-add
          this.marker.push({
            name: feature.properties.N03_004,
            lat: lat1, // 緯度
            lng: lng1, // 経度
            contents: item,
            count: item2
            // patients: this.patientsTable.datasets[idx].累計 + '人'
          })
        }
      }

      // colorの設定
      // (03)
      // for next-step
      let idx = 0 // findindex
      this.gCityName = feature.properties.N03_004
      let thePersonCount = 0
      if (
        (idx = this.patientsTable.datasets.findIndex(
          (v: any) => v.居住地 === feature.properties.N03_004
        )) >= 0
      ) {
        thePersonCount = Number(this.patientsTable.datasets[idx].累計)
      }

      return {
        fillColor: this.getColorF(
          thePersonCount,
          feature.properties.N03_004,
          this.gmaxInfectionPersonCount
        ),
        weight: 0.4,
        opacity: 1,
        color: 'white',
        dashArray: '',
        fillOpacity: 0.8
      }
    },
    getColorF(
      thePersonCount: number,
      cityName: string,
      gmaxInfectionPersonCount: number
    ) {
      // let idx=0;
      let rPercentData = 0
      if (
        this.patientsTable.datasets.findIndex(
          (v: any) => v.居住地 === cityName
        ) >= 0
      ) {
        // if ( (idx = this.patientsTable.datasets.findIndex((v: any) => v.居住地 === cityName) )>=0 ){
        rPercentData = Math.round(
          (thePersonCount / gmaxInfectionPersonCount) * 100
        )
      } else {
        rPercentData = 0
      }
      return this.getColor(rPercentData)
    },
    makePopup(map: any, L: any, marker: any) {
      // for(let i=0; i<this.marker.length; i++) {
      for (const rowMarker of marker) {
        // popup
        const markerPopup = L.marker([rowMarker.lat, rowMarker.lng]).addTo(map)
        markerPopup.bindPopup(rowMarker.contents).addTo(map)

        // circle
        /*
        L.circle([rowMarker.lat, rowMarker.lng], {
          radius: this.markerbase * rowMarker.count,
          color: this.markercolor,
          weight: this.weight
        }).addTo(map)
        */
      }
    }
  },
  head: (): MetaInfo => ({
    title: '陽性者属性(直近２週間)'
  })
})
</script>

<style lang="scss" scoped>
.MapCity {
  @include card-container();

  height: 100%;
  &-Header {
    display: flex;
    align-items: flex-start;
    flex-flow: column;
    padding: 0 10px;
    @include largerThan($medium) {
      padding: 0 5px;
    }
    @include largerThan($large) {
      width: 100%;
      flex-flow: row;
      flex-wrap: wrap;
      padding: 0;
    }
  }
  &-DataInfo {
    @include largerThan($large) {
      text-align: right;
      width: 100%;
      color: $gray-3;
    }
    &-summary {
      display: inline-block;
      font-family: Hiragino Sans, sans-serif;
      font-style: normal;
      font-size: 30px;
      line-height: 30px;
      &-unit {
        font-size: 1em;
      }
      &-date {
        font-size: 0.4em;
        margin-right: 0.4em;
      }
    }
    &-date {
      white-space: wrap;
      display: inline-block;
      font-size: 12px;
      line-height: 12px;
      color: $gray-3;
    }
  }
  &-Inner {
    display: flex;
    flex-flow: column;
    justify-content: space-between;
    padding: 22px;
    height: 100%;
  }
  &-Title {
    width: 100%;
    margin-bottom: 10px;
    font-size: 1.25rem;
    line-height: 1.5;
    font-weight: normal;
    color: $gray-2;
    @include largerThan($large) {
      width: 50%;
      margin-bottom: 0;
    }
  }
  &-CardText {
    margin: 0 0;
  }
  &-CardTextForXS {
    margin-bottom: 46px;
    margin-top: 70px;
  }
  &-Embed {
    background-color: $gray-5;
  }
  &-Footer {
    @include font-size(12);

    padding: 0 !important;
    display: flex;
    justify-content: space-between;
    color: $gray-3 !important;
    text-align: right;
    background-color: $white !important;
    .Permalink {
      color: $gray-3 !important;
    }
    .OpenDataLink {
      text-decoration: none;
      .ExternalLinkIcon {
        vertical-align: text-bottom;
      }
    }
    .Footer-Left {
      text-align: left;
    }
    .Footer-Right {
      position: relative;
      display: flex;
      align-items: flex-end;
      .DataView-Share-Opener {
        cursor: pointer;
        margin-right: 6px;
        > svg {
          width: auto !important;
        }
      }
      .DataView-Share-Buttons {
        position: absolute;
        padding: 8px;
        right: -4px;
        bottom: 1.5em;
        width: 240px;
        border: solid 1px $gray-4;
        background: $white !important;
        border-radius: 8px;
        text-align: left;
        font-size: 1rem;
        z-index: 9000;

        > * {
          padding: 4px 0;
        }

        > .Close-Button {
          display: flex;
          justify-content: flex-end;
          color: $gray-3;
        }

        > .EmbedCode {
          position: relative;
          padding: 4px;
          padding-right: 30px;
          color: rgb(3, 3, 3);
          border: solid 1px #eee;
          border-radius: 8px;
          font-size: 12px;

          .EmbedCode-Copy {
            position: absolute;
            top: 0.3em;
            right: 0.3em;
            color: $gray-3;
          }
        }

        > .Buttons {
          display: flex;
          justify-content: center;
          margin-top: 4px;

          .icon-resize {
            border-radius: 50%;
            width: 30px;
            height: 30px;
            font-size: 30px;
            margin-left: 4px;
            margin-right: 4px;

            &.twitter {
              color: #fff;
              background: #2a96eb;
            }
            &.facebook {
              color: #364e8a;
            }
            &.line {
              color: #1cb127;
            }
          }
        }
      }
    }
  }

  .overlay {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9000;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    user-select: none;
    opacity: 0.8;

    > .overlay-text {
      text-align: center;
      padding: 2em;
      width: 60%;
      background: $gray-2;
      border-radius: 8px;
      color: $white !important;
    }
  }
  &-Map {
    margin: 0 0;
    height: 550px;
  }
  &-Table {
    width: 100%;
    margin-bottom: 10px;
    font-size: 1.4em;
    line-height: 1.5;
    font-weight: normal;
    color: $gray-3;
    &-Style {
      // width: 15%;
      margin-top: 0 !important;
    }
  }
}

/*
.leaflet-control::after {
  content: url(/images/persons01.png);
  z-index: 1000;
  display: block;
  position: absolute;
  bottom: 0.5em;
  right: 1em;
  transform: scale(0.9);
}
*/

.info {
  padding: 6px 8px;
  font: 14px/16px Arial, Helvetica, sans-serif;
  background: white;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  border-radius: 5px;
}
.info h4 {
  margin: 0 0 5px;
  color: #777;
}

/*
.legend {
  padding: 6px 8px;
  font: 14px Arial, Helvetica, sans-serif;
  background: white;
  background: rgba(255, 255, 255, 1.0);
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  line-height: 24px;
  color: #555;
}
*/

.legend {
  background: white;
  background: rgba(255, 255, 255, 0.8);
  background-color: white;
  line-height: 18px;
  color: #555;
}
.legend i {
  width: 18px;
  height: 18px;
  float: left;
  margin-right: 8px;
  opacity: 0.7;
}
</style>
