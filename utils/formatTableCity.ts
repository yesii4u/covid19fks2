import dayjs from 'dayjs'

const headers = [
  { text: '公表日', value: '公表日' },
  { text: '居住地', value: '居住地' },
  { text: '累計', value: '累計' }
]

type DataType = {
  リリース日: string
  居住地: string | null
  累計: number
  [key: string]: any
}

type TableDataType = {
  公表日: string
  居住地: DataType['居住地']
  累計: DataType['累計']
}

type TableDateType = {
  headers: typeof headers
  datasets: TableDataType[]
}

/**
 * Format for DataTable component
 *
 * @param data - Raw data
 */
export default (data: DataType[]) => {
  const tableDate: TableDateType = {
    headers,
    datasets: []
  }

  data.forEach(d => {
    const ymdSub = dayjs()
      .subtract(2, 'w')
      .format('YYYY/MM/DD')
    // yyyy/mm/ddタイプ強制なので、文字列比較で十分
    if (dayjs(d['リリース日']).format('YYYY/MM/DD') >= ymdSub) {
      const TableRow: TableDataType = {
        公表日: dayjs(d['リリース日']).format('YYYY/MM/DD') ?? '不明',
        居住地: d['居住地'] ?? '不明',
        累計: d['累計'] ?? 1
      }
      // tableDate.datasets.push(TableRow)
      const idx = tableDate.datasets.findIndex(
        v => v.居住地 === TableRow['居住地']
      )
      if (idx >= 0) {
        tableDate.datasets[idx].公表日 = TableRow.公表日
        // tableDate.datasets[idx].居住地 = TableRow.居住地;
        tableDate.datasets[idx].累計++
      } else {
        tableDate.datasets.push(TableRow)
      }
    }
  })
  // tableDate.datasets.sort((a, b) => (a === b ? 0 : a < b ? 1 : -1))
  // tableDate.datasets.sort((a, b) => (a.累計 === b.累計 ? 0 : a.累計 < b.累計 ? 1 : -1))
  tableDate.datasets.sort((a, b) =>
    a.公表日 === b.公表日 ? 0 : a.公表日 < b.公表日 ? 1 : -1
  )
  return tableDate
}
