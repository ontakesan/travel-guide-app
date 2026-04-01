import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Pin } from '../types'

// Leafletのデフォルトアイコン修正
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

type Props = {
  pins: Pin[]
  onMapClick?: (lat: number, lng: number) => void
  onPinClick?: (pin: Pin) => void
  readonly?: boolean
}

export default function LeafletMap({ pins, onMapClick, onPinClick, readonly = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())

  // 地図の初期化
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current).setView([35.6812, 139.7671], 12)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)

    if (!readonly) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        onMapClick?.(e.latlng.lat, e.latlng.lng)
      })
    }

    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // ピンの同期
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const currentIds = new Set(pins.map(p => p.id))

    // 削除されたマーカーを除去
    markersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove()
        markersRef.current.delete(id)
      }
    })

    // 新しいマーカーを追加
    pins.forEach((pin, i) => {
      if (markersRef.current.has(pin.id)) return

      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:28px;height:28px;border-radius:50% 50% 50% 0;
          background:#1D9E75;border:2px solid #fff;
          box-shadow:0 2px 6px rgba(0,0,0,0.3);
          transform:rotate(-45deg);
          display:flex;align-items:center;justify-content:center;
        "><span style="transform:rotate(45deg);color:#fff;font-size:11px;font-weight:bold">${i + 1}</span></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      })

      const marker = L.marker([pin.lat, pin.lng], { icon })
        .addTo(map)
        .bindTooltip(pin.title, { direction: 'top', offset: [0, -28] })

      marker.on('click', () => onPinClick?.(pin))
      markersRef.current.set(pin.id, marker)
    })

    // ピンがあれば全体が見えるようにフィット
    if (pins.length > 0 && markersRef.current.size === pins.length) {
      const group = L.featureGroup([...markersRef.current.values()])
      map.fitBounds(group.getBounds().pad(0.2))
    }
  }, [pins])

  return <div ref={containerRef} className="w-full h-full" />
}
