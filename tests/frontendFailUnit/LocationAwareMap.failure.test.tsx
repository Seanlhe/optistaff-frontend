import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { LocationAwareMap, MapError } from '../../src/components/LocationAwareMap';

// Mock Leaflet to fail initialization
vi.mock('leaflet', () => ({
  map: vi.fn(() => {
    throw new Error('Leaflet map initialization failed');
  }),
  tileLayer: vi.fn(() => {
    throw new Error('Tile layer failed to load');
  }),
  marker: vi.fn(() => {
    throw new Error('Marker creation failed');
  }),
  circle: vi.fn(() => {
    throw new Error('Circle creation failed');
  }),
  icon: vi.fn(() => {
    throw new Error('Icon creation failed');
  })
}));

// Mock react-leaflet components to fail
vi.mock('react-leaflet', () => ({
  MapContainer: vi.fn(({ children }) => {
    throw new Error('MapContainer failed to initialize');
  }),
  TileLayer: vi.fn(() => {
    throw new Error('TileLayer component crashed');
  }),
  Marker: vi.fn(() => {
    throw new Error('Marker component failed to render');
  }),
  Circle: vi.fn(() => {
    throw new Error('Circle component crashed');
  }),
  useMap: vi.fn(() => {
    throw new Error('useMap hook failed');
  })
}));

// Mock geolocation API to fail
Object.defineProperty(global.navigator, 'geolocation', {
  value: {
    getCurrentPosition: vi.fn((success, error) => {
      error({
        code: 1,
        message: 'Geolocation permission denied'
      });
    }),
    watchPosition: vi.fn(() => {
      throw new Error('Watch position not supported');
    })
  },
  writable: true
});

describe('LocationAwareMap - Failure Scenarios', () => {
  const mockOnRadiusChange = vi.fn();
  const mockOnLocationError = vi.fn();
  const mockOnRetry = vi.fn();

  const defaultProps = {
    homeLocation: undefined,
    travelRadius: 15,
    onRadiusChange: mockOnRadiusChange,
    loading: false,
    className: 'test-map',
    onLocationError: mockOnLocationError,
    onRetry: mockOnRetry
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fail to render due to Leaflet initialization error', () => {
    expect(() => {
      render(<LocationAwareMap {...defaultProps} />);
    }).toThrow('MapContainer failed to initialize');
  });

  it('should fail geolocation with permission denied', async () => {
    // Mock MapContainer to work but geolocation to fail
    vi.mocked(require('react-leaflet').MapContainer).mockImplementation(({ children }) => (
      <div data-testid="map-container">{children}</div>
    ));

    render(<LocationAwareMap {...defaultProps} />);

    // Should call onLocationError with permission denied error
    await waitFor(() => {
      expect(mockOnLocationError).toHaveBeenCalledWith({
        type: 'PERMISSION_DENIED',
        message: 'Geolocation permission denied',
        canRetry: false,
        fallbackAvailable: true
      });
    });
  });

  it('should fail marker rendering with invalid coordinates', () => {
    const invalidProps = {
      ...defaultProps,
      homeLocation: [NaN, NaN] as [number, number] // Invalid coordinates
    };

    vi.mocked(require('react-leaflet').MapContainer).mockImplementation(() => (
      <div data-testid="map-container" />
    ));

    expect(() => {
      render(<LocationAwareMap {...invalidProps} />);
    }).toThrow();
  });

  it('should fail circle rendering with negative radius', () => {
    const invalidProps = {
      ...defaultProps,
      homeLocation: [1.3521, 103.8198] as [number, number],
      travelRadius: -10 // Negative radius
    };

    vi.mocked(require('react-leaflet').MapContainer).mockImplementation(() => (
      <div data-testid="map-container" />
    ));
    vi.mocked(require('react-leaflet').Marker).mockImplementation(() => (
      <div data-testid="marker" />
    ));

    expect(() => {
      render(<LocationAwareMap {...invalidProps} />);
    }).toThrow('Circle component crashed');
  });

  it('should fail slider operations with corrupted event handlers', () => {
    vi.mocked(require('react-leaflet').MapContainer).mockImplementation(({ children }) => (
      <div data-testid="map-container">
        {children}
        <input 
          type="range" 
          data-testid="radius-slider" 
          min="5" 
          max="30" 
          defaultValue="15"
        />
      </div>
    ));

    const corruptedProps = {
      ...defaultProps,
      onRadiusChange: null as any // Corrupted handler
    };

    const { getByTestId } = render(<LocationAwareMap {...corruptedProps} />);
    const slider = getByTestId('radius-slider');

    expect(() => {
      fireEvent.change(slider, { target: { value: '20' } });
    }).toThrow();
  });

  it('should fail tile layer loading with network error', () => {
    vi.mocked(require('react-leaflet').MapContainer).mockImplementation(({ children }) => (
      <div data-testid="map-container">{children}</div>
    ));

    expect(() => {
      render(<LocationAwareMap {...defaultProps} />);
    }).toThrow('TileLayer component crashed');
  });

  it('should fail retry operations with invalid state', async () => {
    vi.mocked(require('react-leaflet').MapContainer).mockImplementation(({ children }) => (
      <div data-testid="map-container">
        {children}
        <button data-testid="retry-button">Retry</button>
      </div>
    ));

    const invalidProps = {
      ...defaultProps,
      onRetry: vi.fn(() => {
        throw new Error('Retry operation failed');
      })
    };

    const { getByTestId } = render(<LocationAwareMap {...invalidProps} />);
    const retryButton = getByTestId('retry-button');

    expect(() => {
      fireEvent.click(retryButton);
    }).toThrow('Retry operation failed');
  });

  it('should fail distance calculations with invalid radius values', () => {
    const invalidProps = {
      ...defaultProps,
      homeLocation: [1.3521, 103.8198] as [number, number],
      travelRadius: Infinity // Invalid radius
    };

    vi.mocked(require('react-leaflet').MapContainer).mockImplementation(() => (
      <div data-testid="map-container" />
    ));

    expect(() => {
      render(<LocationAwareMap {...invalidProps} />);
    }).toThrow();
  });

  it('should fail loading overlay with corrupted loading state', () => {
    const corruptedProps = {
      ...defaultProps,
      loading: 'invalid' as any // Invalid loading state
    };

    vi.mocked(require('react-leaflet').MapContainer).mockImplementation(({ children }) => (
      <div data-testid="map-container">{children}</div>
    ));

    expect(() => {
      render(<LocationAwareMap {...corruptedProps} />);
    }).toThrow();
  });

  it('should fail error boundary with unhandled map errors', () => {
    vi.mocked(require('react-leaflet').MapContainer).mockImplementation(() => {
      throw new Error('Unhandled map rendering error');
    });

    expect(() => {
      render(<LocationAwareMap {...defaultProps} />);
    }).toThrow('Unhandled map rendering error');
  });
});