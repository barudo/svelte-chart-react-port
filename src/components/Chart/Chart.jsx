import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import linear from './linear'
import './Chart.css'

const SCALES = ['3 months', '6 months', '1 year', 'All time']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function Chart({ visits, metrics }) {
  const metricKeys = useMemo(() => Object.keys(metrics || {}), [metrics])

  const metricsWithRange = useMemo(() => {
    const out = {}
    for (const [key, values] of Object.entries(metrics || {})) {
      const arr = values.slice()
      const [mn, mx] = minMax(arr, 'value')
      arr.min = mn
      arr.max = mx
      out[key] = arr
    }
    return out
  }, [metrics])

  const { minDate, maxDate } = useMemo(() => {
    const metricValues = Object.values(metricsWithRange)
    let range = [Infinity, -Infinity]
    for (const arr of metricValues) {
      if (!arr.length) continue
      const [mn, mx] = minMax(arr, 'date')
      if (mn < range[0]) range[0] = mn
      if (mx > range[1]) range[1] = mx
    }

    let min = range[0]
    let max = range[1]

    if (!isFinite(min) || !isFinite(max)) {
      min = visits[0] || new Date()
      max = visits[0] || new Date()
    }

    if (visits.length) {
      if (visits[0] < min) min = visits[0]
      if (visits[visits.length - 1] < max) max = visits[visits.length - 1]
    }

    return { minDate: min, maxDate: max }
  }, [metricsWithRange, visits])

  const [activeScale, setActiveScale] = useState('All time')
  const [activeMetric, setActiveMetric] = useState(metricKeys[0] || '')
  const [activeDisplay, setActiveDisplay] = useState('values')
  const [activeVisit, setActiveVisit] = useState(null)
  const [chartMinDate, setChartMinDate] = useState(minDate)

  useEffect(() => {
    if (activeScale === 'All time') {
      setChartMinDate(minDate)
    }
  }, [activeScale, minDate])

  useEffect(() => {
    if (!metricKeys.length) return
    if (!metricKeys.includes(activeMetric)) {
      setActiveMetric(metricKeys[0])
    }
  }, [activeMetric, metricKeys])

  const labelWidthPct = 30
  const rowHeightPct = metricKeys.length ? 50 / metricKeys.length : 50

  const gridRef = useRef(null)
  const optionsRef = useRef(null)
  const chartRef = useRef(null)
  const [gridSize, setGridSize] = useState({ width: 0, height: 0 })
  const [optionsHeight, setOptionsHeight] = useState(0)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useLayoutEffect(() => {
    if (!gridRef.current) return

    const gridEl = gridRef.current
    const updateGrid = () => {
      setGridSize({ width: gridEl.offsetWidth, height: gridEl.offsetHeight })
    }

    updateGrid()
    const ro = new ResizeObserver(updateGrid)
    ro.observe(gridEl)

    return () => ro.disconnect()
  }, [])

  useLayoutEffect(() => {
    if (!optionsRef.current) return

    const optionsEl = optionsRef.current
    const updateOptions = () => {
      setOptionsHeight(optionsEl.offsetHeight)
    }

    updateOptions()
    const ro = new ResizeObserver(updateOptions)
    ro.observe(optionsEl)

    return () => ro.disconnect()
  }, [])

  const chartHeight = Math.max(gridSize.height - optionsHeight, 0)

  useLayoutEffect(() => {
    if (!chartRef.current) return

    const el = chartRef.current
    const update = () => {
      setSize({ width: el.offsetWidth, height: el.offsetHeight })
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)

    return () => ro.disconnect()
  }, [])

  const svgWidth = size.width * (100 - labelWidthPct) / 100
  const svgHeight = size.height * rowHeightPct / 100
  const svgHeightLarge = size.height * 0.5

  const xScale = useMemo(() => {
    if (!svgWidth) return null
    return linear([chartMinDate, maxDate], [svgWidth * 0.05, svgWidth * 0.92])
  }, [chartMinDate, maxDate, svgWidth])

  const hticks = useMemo(() => {
    if (!xScale) return []
    const count = activeScale === 'All time' ? 8 : 6
    const step = (maxDate - chartMinDate) / count
    return Array.from({ length: count + 1 }, (_, i) => new Date(step * i + chartMinDate.valueOf()))
  }, [activeScale, chartMinDate, maxDate, xScale])

  const formatTick = useCallback(
    (tick) => {
      if (activeScale === 'All time') return tick.getFullYear()
      return `${MONTHS[tick.getMonth()]}/${(`${tick.getFullYear()}`).slice(2, 4)}`
    },
    [activeScale]
  )

  const getValueFontSize = useCallback((value, base) => {
    const len = String(Math.abs(value)).replace(/\D/g, '').length
    if (len >= 3) return `${Math.max(base - 2, 8)}px`
    return `${base}px`
  }, [])

  const handleWheel = useCallback(
    (event) => {
      if (!activeVisit) return
      const wheelDelta = event.deltaY ? -event.deltaY : event.wheelDelta
      let i = visits.indexOf(activeVisit)
      wheelDelta < 0 ? --i : i++
      if (i < 0 || i > visits.length - 1) return
      setActiveVisit(visits[i])
    },
    [activeVisit, visits]
  )

  const handleScaleChange = useCallback(
    (timescale) => {
      if (activeScale === timescale) return
      const MS_PER_DAY = 1000 * 60 * 60 * 24
      const nextMin = timescale === 'All time'
        ? minDate
        : timescale === '1 year'
          ? (Date.now() - MS_PER_DAY * 365)
          : timescale === '6 months'
            ? (Date.now() - MS_PER_DAY * 180)
            : (Date.now() - MS_PER_DAY * 90)

      setChartMinDate(nextMin)
      setActiveScale(timescale)
    },
    [activeScale, minDate]
  )

  const makePath = useCallback(
    (yScale, arr) => {
      return `M${arr.map(({ date, value }) => ` ${xScale(date)},${yScale(value)} `).join('L')}`
    },
    [xScale]
  )

  const mounted = svgWidth > 0 && svgHeight > 0 && xScale

  return (
    <div id="chart-grid" ref={gridRef}>
      <div className="region" id="options-bar" ref={optionsRef}>
        <div className="options-group">
          <div className="bold">VIEW BY:</div>
          <div className="button-group">
            {SCALES.map((sc, i) => (
              <div
                key={sc}
                className={[
                  'button',
                  i === 0 ? 'button-left' : '',
                  i === SCALES.length - 1 ? 'button-right' : '',
                  activeScale === sc ? 'bold' : ''
                ].filter(Boolean).join(' ')}
                onClick={() => handleScaleChange(sc)}
              >
                {sc}
              </div>
            ))}
          </div>
        </div>
        <div className="options-group">
          <div><b>DISPLAY:</b></div>
          <div className="button-group">
            <div
              className={[
                'button',
                'button-left',
                activeDisplay === 'charts' ? 'bold' : ''
              ].filter(Boolean).join(' ')}
              onClick={() => { if (activeDisplay !== 'charts') setActiveDisplay('charts') }}
            >
              charts
            </div>
            <div
              className={[
                'button',
                'button-right',
                activeDisplay === 'values' ? 'bold' : ''
              ].filter(Boolean).join(' ')}
              onClick={() => { if (activeDisplay !== 'values') setActiveDisplay('values') }}
            >
              values
            </div>
          </div>
        </div>
      </div>

      <div id="chart" ref={chartRef} style={{ height: chartHeight ? `${chartHeight}px` : undefined }}>
        <div className="chart-row" style={{ height: `${rowHeightPct}%` }}>
          <div className="column-header" style={{ width: `${labelWidthPct}%` }}>
            <div>LAB/METRIC</div>
          </div>
          <div style={{ width: `${100 - labelWidthPct}%` }}>
            {mounted && (
              <svg
                width={svgWidth}
                height={svgHeight}
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                preserveAspectRatio="none"
                onWheel={handleWheel}
              >
                {hticks.map((tick) => (
                  <text
                    key={tick.toISOString()}
                    className="axis-horizontal"
                    x={xScale(tick)}
                    y={svgHeight * 0.4}
                    textAnchor="middle"
                  >
                    {formatTick(tick)}
                  </text>
                ))}

                {visits.map((v) => {
                  const x = xScale(v)
                  const active = activeVisit === v
                  return (
                    <g key={v.toISOString()} className={`visit ${active ? 'active-visit' : ''}`.trim()}>
                      <line x1={x} x2={x} y1={svgHeight * 0.8} y2={svgHeight} />
                      <circle
                        cx={x}
                        cy={svgHeight * 0.8}
                        r={7}
                        onClick={() => setActiveVisit(active ? null : v)}
                      />
                      <text className="visit-label" x={x} y={svgHeight * 0.8} textAnchor="middle">v</text>
                    </g>
                  )
                })}
              </svg>
            )}
          </div>
        </div>

        {Object.entries(metricsWithRange).map(([key, met]) => {
          const active = activeMetric === key
          const h = active ? svgHeightLarge : svgHeight
          const yScale = linear([met.min, met.max], [h * 0.9, h * 0.1])
          const midY = yScale((met.min + met.max) / 2)

          return (
            <div
              key={key}
              className={`chart-row metric-row ${active ? 'active-metric' : ''}`.trim()}
              style={{ height: `${active ? 50 : rowHeightPct}%` }}
            >
              <div
                className="metric-header"
                style={{ width: `${labelWidthPct}%` }}
                onClick={() => setActiveMetric(key)}
              >
                <div className="metric-text">{key}</div>
                <div className="axis-vertical" style={{ padding: active ? `${h * 0.05}px 0` : '0' }}>
                  <div>{met.max}</div>
                  {active && (
                    <>
                      <div>-</div><div>-</div><div>-</div>
                    </>
                  )}
                  <div>{met.min}</div>
                </div>
              </div>

              <div style={{ width: `${100 - labelWidthPct}%` }}>
                {mounted && (
                  <svg width={svgWidth} height={h} viewBox={`0 0 ${svgWidth} ${h}`} preserveAspectRatio="none">
                    {visits.map((v) => (
                      <g key={v.toISOString()} className={activeVisit === v ? 'active-visit' : ''}>
                        <line x1={xScale(v)} x2={xScale(v)} y1={0} y2={h} />
                      </g>
                    ))}

                    {active || activeDisplay === 'charts' ? (
                      <>
                        <path d={makePath(yScale, met)} />

                        {met.map((val) => {
                          const x = xScale(val.date)
                          const y = yScale(val.value)
                          const visible = activeVisit && (val.date - activeVisit === 0)
                          return (
                            <g key={`${key}-${val.date.toISOString()}-${val.value}`}>
                              <circle className="value-dot" cx={x} cy={y} r={3} />
                              <g className="tooltip" style={{ visibility: visible ? 'visible' : undefined }}>
                                <rect
                                  className="tooltip-bg"
                                  x={x + 3}
                                  y={(y < 26 ? 4 : y - 22)}
                                  rx="3"
                                  ry="3"
                                  width="24"
                                  height="18"
                                />
                                <text
                                  x={x + 15}
                                  y={(y < 26 ? 19 : y - 7)}
                                  textAnchor="middle"
                                  style={{ fontSize: getValueFontSize(val.value, 12) }}
                                >
                                  {val.value}
                                </text>
                              </g>
                            </g>
                          )
                        })}
                      </>
                    ) : (
                      met.map((val) => {
                        const x = xScale(val.date)
                        return (
                          <g key={`${key}-${val.date.toISOString()}-${val.value}-box`}>
                            <rect className="value-box" x={x - 12} y={midY - 12} rx="3" ry="3" width="24" height="24" />
                            <text
                              className="value-text"
                              x={x}
                              y={midY + 6}
                              textAnchor="middle"
                              style={{ fontSize: getValueFontSize(val.value, 12) }}
                            >
                              {val.value}
                            </text>
                          </g>
                        )
                      })
                    )}
                  </svg>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function minMax(arr, field) {
  return arr.reduce((acc, d) => {
    if (d[field] < acc[0]) acc[0] = d[field]
    if (d[field] > acc[1]) acc[1] = d[field]
    return acc
  }, [Infinity, -Infinity])
}
