'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  lat: number;
  lon: number;
  zoom?: number;
  markerLabel?: string;
  draggable?: boolean;
  onMarkerDragEnd?: (lat: number, lon: number) => void;
}

/**
 * Leaflet 地図コンポーネント（クライアントサイドのみ）
 */
export default function MapView({ lat, lon, zoom = 16, markerLabel, draggable = false, onMarkerDragEnd }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // 既存のマップインスタンスを破棄
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    // マップ初期化
    const map = L.map(mapRef.current).setView([lat, lon], zoom);
    mapInstanceRef.current = map;

    // OpenStreetMapタイルレイヤー
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // カスタムマーカーアイコン
    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #6366f1, #4f46e5);
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        border: 2px solid white;
        ${draggable ? 'cursor: grab;' : ''}
      "><span style="
        transform: rotate(45deg);
        font-size: 16px;
      ">📍</span></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    // マーカー追加
    const marker = L.marker([lat, lon], { 
      icon: customIcon,
      draggable: draggable 
    }).addTo(map);

    if (markerLabel) {
      marker.bindPopup(`<b>${markerLabel}</b>`).openPopup();
    }

    if (draggable && onMarkerDragEnd) {
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        onMarkerDragEnd(position.lat, position.lng);
      });
    }

    // クリーンアップ
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lon, zoom, markerLabel]);

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '400px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
      }}
    />
  );
}
