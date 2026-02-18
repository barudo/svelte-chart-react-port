import { useMemo, useState } from 'react'
import Chart from './components/Chart/Chart.jsx'
import './Metrics.css'

export default function Metrics({ height = '600px', width = '800px' }) {
  const dataModules = useMemo(() => {
    const modules = import.meta.glob('./data/*.js', { eager: true })
    return Object.entries(modules).map(([path, mod]) => {
      const file = path.split('/').pop() || path
      const key = file.replace(/\.[^.]+$/, '')
      const payload = mod.default || mod
      return {
        key,
        label: payload.label || key,
        data: payload
      }
    })
  }, [])

  const [selectedKey, setSelectedKey] = useState(dataModules[0]?.key || '')

  const selectedData = useMemo(() => {
    return dataModules.find((entry) => entry.key === selectedKey)?.data || { testlabs: [], visits: [] }
  }, [dataModules, selectedKey])

  const metrics = useMemo(() => processLabs(selectedData.testlabs), [selectedData])

  const vsort = useMemo(() => {
    return (selectedData.visits || []).map((d) => new Date(d)).sort((a, b) => a - b)
  }, [selectedData])

  return (
    <div id="container-grid" style={{ height, width }}>
      <div>Tracking Labs &amp; Disease Metrics</div>
      <div>
        <Chart visits={vsort} metrics={metrics} />
      </div>
      <div className="data-select">
        <label>
          Data:
          <select value={selectedKey} onChange={(event) => setSelectedKey(event.target.value)}>
            {dataModules.map((entry) => (
              <option key={entry.key} value={entry.key}>{entry.label}</option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}

function processLabs(labs) {
  if (!labs || labs.length === 0) return {}

  const grouped = labs.reduce((acc, d) => {
    const name = d['lab/name']
    if (!acc[name]) acc[name] = []
    acc[name].push({
      value: d['lab/value'],
      date: new Date(d['lab/when']),
      demographic: d['lab/demographic']
    })
    return acc
  }, {})

  Object.keys(grouped).forEach((key) => {
    grouped[key].sort((a, b) => a.date - b.date)
  })

  return grouped
}
