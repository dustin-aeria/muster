import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { Check, Pipette, Copy, ChevronDown } from 'lucide-react';

/**
 * Batch 113: ColorPicker Component
 *
 * Color selection components.
 *
 * Exports:
 * - ColorPicker: Full color picker
 * - ColorSwatch: Color swatch selector
 * - ColorPalette: Predefined color palette
 * - ColorInput: Hex color input
 * - GradientPicker: Gradient selector
 * - ColorPreview: Color preview box
 * - OpacitySlider: Opacity/alpha slider
 * - HueSlider: Hue selector slider
 */

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return {
    r: Math.round(f(0) * 255),
    g: Math.round(f(8) * 255),
    b: Math.round(f(4) * 255),
  };
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// ============================================================================
// COLOR PREVIEW - Color preview box
// ============================================================================
export function ColorPreview({
  color,
  size = 'md',
  showAlpha = false,
  onClick,
  className,
  ...props
}) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  };

  return (
    <div
      className={cn(
        'rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden',
        sizeClasses[size],
        onClick && 'cursor-pointer hover:ring-2 hover:ring-blue-500',
        className
      )}
      onClick={onClick}
      style={{
        background: showAlpha
          ? `linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)`
          : undefined,
        backgroundSize: showAlpha ? '8px 8px' : undefined,
        backgroundPosition: showAlpha ? '0 0, 0 4px, 4px -4px, -4px 0px' : undefined,
      }}
      {...props}
    >
      <div
        className="w-full h-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

// ============================================================================
// COLOR INPUT - Hex color input
// ============================================================================
export const ColorInput = forwardRef(function ColorInput({
  value,
  onChange,
  showPreview = true,
  showCopy = true,
  size = 'md',
  disabled = false,
  className,
  ...props
}, ref) {
  const [inputValue, setInputValue] = useState(value || '');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base',
  };

  const handleChange = (e) => {
    let val = e.target.value;
    if (!val.startsWith('#')) {
      val = '#' + val;
    }
    setInputValue(val);

    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      onChange?.(val);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus-within:ring-2 focus-within:ring-blue-500',
        sizeClasses[size],
        disabled && 'opacity-50',
        className
      )}
      {...props}
    >
      {showPreview && (
        <ColorPreview color={value} size="sm" />
      )}
      <input
        ref={ref}
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder="#000000"
        disabled={disabled}
        className="flex-1 bg-transparent border-0 outline-none font-mono"
        maxLength={7}
      />
      {showCopy && (
        <button
          type="button"
          onClick={handleCopy}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      )}
    </div>
  );
});

// ============================================================================
// HUE SLIDER - Hue selector slider
// ============================================================================
export function HueSlider({
  value,
  onChange,
  className,
  ...props
}) {
  const sliderRef = useRef(null);

  const handleMouseDown = (e) => {
    const updateValue = (clientX) => {
      if (!sliderRef.current) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const hue = Math.round((x / rect.width) * 360);
      onChange?.(hue);
    };

    updateValue(e.clientX);

    const handleMouseMove = (e) => updateValue(e.clientX);
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      ref={sliderRef}
      className={cn(
        'relative h-3 rounded-full cursor-pointer',
        className
      )}
      style={{
        background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
      }}
      onMouseDown={handleMouseDown}
      {...props}
    >
      <div
        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md border-2 border-white"
        style={{ left: `calc(${(value / 360) * 100}% - 8px)` }}
      />
    </div>
  );
}

// ============================================================================
// OPACITY SLIDER - Opacity/alpha slider
// ============================================================================
export function OpacitySlider({
  value,
  onChange,
  color = '#000000',
  className,
  ...props
}) {
  const sliderRef = useRef(null);

  const handleMouseDown = (e) => {
    const updateValue = (clientX) => {
      if (!sliderRef.current) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const opacity = Math.round((x / rect.width) * 100);
      onChange?.(opacity);
    };

    updateValue(e.clientX);

    const handleMouseMove = (e) => updateValue(e.clientX);
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      ref={sliderRef}
      className={cn(
        'relative h-3 rounded-full cursor-pointer',
        className
      )}
      style={{
        background: `linear-gradient(to right, transparent, ${color}), linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
        backgroundSize: '100% 100%, 8px 8px, 8px 8px, 8px 8px, 8px 8px',
        backgroundPosition: '0 0, 0 0, 0 4px, 4px -4px, -4px 0px',
      }}
      onMouseDown={handleMouseDown}
      {...props}
    >
      <div
        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md border-2 border-white"
        style={{ left: `calc(${value}% - 8px)` }}
      />
    </div>
  );
}

// ============================================================================
// COLOR SWATCH - Color swatch selector
// ============================================================================
export function ColorSwatch({
  colors,
  value,
  onChange,
  size = 'md',
  showCheck = true,
  className,
  ...props
}) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  return (
    <div className={cn('flex flex-wrap gap-2', className)} {...props}>
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange?.(color)}
          className={cn(
            'rounded-md border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            sizeClasses[size],
            value === color
              ? 'border-gray-900 dark:border-white scale-110'
              : 'border-transparent hover:scale-105'
          )}
          style={{ backgroundColor: color }}
          title={color}
        >
          {showCheck && value === color && (
            <Check
              className={cn(
                'w-full h-full p-1',
                isLightColor(color) ? 'text-gray-900' : 'text-white'
              )}
            />
          )}
        </button>
      ))}
    </div>
  );
}

function isLightColor(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 155;
}

// ============================================================================
// COLOR PALETTE - Predefined color palette
// ============================================================================
const defaultPalette = {
  gray: ['#f9fafb', '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280', '#4b5563', '#374151', '#1f2937', '#111827'],
  red: ['#fef2f2', '#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d'],
  orange: ['#fff7ed', '#ffedd5', '#fed7aa', '#fdba74', '#fb923c', '#f97316', '#ea580c', '#c2410c', '#9a3412', '#7c2d12'],
  yellow: ['#fefce8', '#fef9c3', '#fef08a', '#fde047', '#facc15', '#eab308', '#ca8a04', '#a16207', '#854d0e', '#713f12'],
  green: ['#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d'],
  blue: ['#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'],
  purple: ['#faf5ff', '#f3e8ff', '#e9d5ff', '#d8b4fe', '#c084fc', '#a855f7', '#9333ea', '#7e22ce', '#6b21a8', '#581c87'],
  pink: ['#fdf2f8', '#fce7f3', '#fbcfe8', '#f9a8d4', '#f472b6', '#ec4899', '#db2777', '#be185d', '#9d174d', '#831843'],
};

export function ColorPalette({
  value,
  onChange,
  palette = defaultPalette,
  size = 'sm',
  className,
  ...props
}) {
  return (
    <div className={cn('space-y-1', className)} {...props}>
      {Object.entries(palette).map(([name, colors]) => (
        <ColorSwatch
          key={name}
          colors={colors}
          value={value}
          onChange={onChange}
          size={size}
          showCheck
        />
      ))}
    </div>
  );
}

// ============================================================================
// SATURATION BRIGHTNESS PICKER
// ============================================================================
function SaturationBrightnessPicker({
  hue,
  saturation,
  brightness,
  onChange,
  className,
}) {
  const pickerRef = useRef(null);

  const handleMouseDown = (e) => {
    const updateValue = (clientX, clientY) => {
      if (!pickerRef.current) return;
      const rect = pickerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const y = Math.max(0, Math.min(clientY - rect.top, rect.height));
      const s = Math.round((x / rect.width) * 100);
      const b = Math.round(100 - (y / rect.height) * 100);
      onChange?.({ saturation: s, brightness: b });
    };

    updateValue(e.clientX, e.clientY);

    const handleMouseMove = (e) => updateValue(e.clientX, e.clientY);
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      ref={pickerRef}
      className={cn('relative w-full h-40 rounded-lg cursor-crosshair', className)}
      style={{
        background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))`,
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md"
        style={{
          left: `${saturation}%`,
          top: `${100 - brightness}%`,
          backgroundColor: `hsl(${hue}, ${saturation}%, ${brightness / 2}%)`,
        }}
      />
    </div>
  );
}

// ============================================================================
// COLOR PICKER - Full color picker
// ============================================================================
export function ColorPicker({
  value,
  onChange,
  showInput = true,
  showPalette = true,
  showOpacity = false,
  palette,
  presetColors,
  className,
  ...props
}) {
  const rgb = hexToRgb(value) || { r: 0, g: 0, b: 0 };
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const [hue, setHue] = useState(hsl.h);
  const [saturation, setSaturation] = useState(hsl.s);
  const [lightness, setLightness] = useState(hsl.l);
  const [opacity, setOpacity] = useState(100);

  useEffect(() => {
    const rgb = hexToRgb(value);
    if (rgb) {
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      setHue(hsl.h);
      setSaturation(hsl.s);
      setLightness(hsl.l);
    }
  }, [value]);

  const handleSaturationBrightnessChange = ({ saturation: s, brightness: b }) => {
    setSaturation(s);
    setLightness(b);
    const rgb = hslToRgb(hue, s, b);
    onChange?.(rgbToHex(rgb.r, rgb.g, rgb.b));
  };

  const handleHueChange = (h) => {
    setHue(h);
    const rgb = hslToRgb(h, saturation, lightness);
    onChange?.(rgbToHex(rgb.r, rgb.g, rgb.b));
  };

  return (
    <div className={cn('w-64 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700', className)} {...props}>
      <SaturationBrightnessPicker
        hue={hue}
        saturation={saturation}
        brightness={lightness * 2}
        onChange={handleSaturationBrightnessChange}
        className="mb-4"
      />

      <HueSlider
        value={hue}
        onChange={handleHueChange}
        className="mb-4"
      />

      {showOpacity && (
        <OpacitySlider
          value={opacity}
          onChange={setOpacity}
          color={value}
          className="mb-4"
        />
      )}

      {showInput && (
        <div className="flex items-center gap-2 mb-4">
          <ColorPreview color={value} size="lg" showAlpha={showOpacity} />
          <ColorInput
            value={value}
            onChange={onChange}
            showPreview={false}
            className="flex-1"
          />
        </div>
      )}

      {presetColors && (
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Presets</p>
          <ColorSwatch
            colors={presetColors}
            value={value}
            onChange={onChange}
            size="sm"
          />
        </div>
      )}

      {showPalette && (
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Palette</p>
          <ColorPalette
            value={value}
            onChange={onChange}
            palette={palette}
            size="sm"
          />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COLOR PICKER TRIGGER - Button that opens color picker
// ============================================================================
export function ColorPickerTrigger({
  value,
  onChange,
  label,
  size = 'md',
  disabled = false,
  className,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sizeClasses = {
    sm: 'h-8 px-2 text-sm',
    md: 'h-10 px-3 text-sm',
    lg: 'h-12 px-4 text-base',
  };

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)} {...props}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors',
          sizeClasses[size],
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <ColorPreview color={value} size="sm" />
        {label && <span className="text-gray-700 dark:text-gray-300">{label}</span>}
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50">
          <ColorPicker
            value={value}
            onChange={onChange}
            showPalette={false}
            presetColors={[
              '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6',
              '#8b5cf6', '#ec4899', '#000000', '#ffffff', '#6b7280',
            ]}
          />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// GRADIENT PICKER - Gradient selector
// ============================================================================
export function GradientPicker({
  value,
  onChange,
  presets = [],
  className,
  ...props
}) {
  const [gradientType, setGradientType] = useState('linear');
  const [angle, setAngle] = useState(90);
  const [stops, setStops] = useState([
    { color: '#3b82f6', position: 0 },
    { color: '#8b5cf6', position: 100 },
  ]);

  const generateGradient = () => {
    const stopString = stops
      .sort((a, b) => a.position - b.position)
      .map((s) => `${s.color} ${s.position}%`)
      .join(', ');

    return gradientType === 'linear'
      ? `linear-gradient(${angle}deg, ${stopString})`
      : `radial-gradient(circle, ${stopString})`;
  };

  useEffect(() => {
    onChange?.(generateGradient());
  }, [gradientType, angle, stops]);

  const handleStopColorChange = (index, color) => {
    const newStops = [...stops];
    newStops[index].color = color;
    setStops(newStops);
  };

  return (
    <div className={cn('w-64 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700', className)} {...props}>
      <div
        className="w-full h-24 rounded-lg mb-4"
        style={{ background: generateGradient() }}
      />

      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setGradientType('linear')}
          className={cn(
            'flex-1 py-1 text-sm rounded-md transition-colors',
            gradientType === 'linear'
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          )}
        >
          Linear
        </button>
        <button
          type="button"
          onClick={() => setGradientType('radial')}
          className={cn(
            'flex-1 py-1 text-sm rounded-md transition-colors',
            gradientType === 'radial'
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          )}
        >
          Radial
        </button>
      </div>

      {gradientType === 'linear' && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Angle: {angle}°
          </label>
          <input
            type="range"
            min="0"
            max="360"
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
            className="w-full"
          />
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Color Stops</p>
        {stops.map((stop, index) => (
          <div key={index} className="flex items-center gap-2">
            <ColorPreview
              color={stop.color}
              size="sm"
              onClick={() => {
                const newColor = prompt('Enter hex color:', stop.color);
                if (newColor) handleStopColorChange(index, newColor);
              }}
            />
            <input
              type="range"
              min="0"
              max="100"
              value={stop.position}
              onChange={(e) => {
                const newStops = [...stops];
                newStops[index].position = Number(e.target.value);
                setStops(newStops);
              }}
              className="flex-1"
            />
            <span className="text-xs text-gray-500 w-8">{stop.position}%</span>
          </div>
        ))}
      </div>

      {presets.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Presets</p>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onChange?.(preset)}
                className="w-8 h-8 rounded-md border border-gray-200 dark:border-gray-700"
                style={{ background: preset }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ColorPicker;
