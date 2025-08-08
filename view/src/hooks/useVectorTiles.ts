import { useMemo } from 'react';
import geojsonvt from 'geojson-vt';

export interface VectorTileOptions {
  maxZoom: number;
  tolerance: number;
  extent: number;
  buffer: number;
}

const defaultOptions: VectorTileOptions = {
  maxZoom: 14,  // max zoom to preserve detail on
  tolerance: 3, // simplification tolerance (higher means simpler)
  extent: 4096, // tile extent (both width and height)
  buffer: 64,   // tile buffer on each side
};

export function useVectorTiles(
  geojsonData: any,
  options: Partial<VectorTileOptions> = {}
) {
  const tileIndex = useMemo(() => {
    if (!geojsonData || !geojsonData.features || geojsonData.features.length === 0) {
      return null;
    }

    const mergedOptions = { ...defaultOptions, ...options };
    
    try {
      // Create vector tile index from GeoJSON
      return geojsonvt(geojsonData, mergedOptions);
    } catch (error) {
      console.error('Error creating vector tiles:', error);
      return null;
    }
  }, [geojsonData, options]);

  const getTile = useMemo(() => {
    if (!tileIndex) return null;
    
    return (z: number, x: number, y: number) => {
      try {
        return tileIndex.getTile(z, x, y);
      } catch (error) {
        console.error('Error getting tile:', error);
        return null;
      }
    };
  }, [tileIndex]);

  return {
    tileIndex,
    getTile,
    isReady: !!tileIndex,
  };
}
