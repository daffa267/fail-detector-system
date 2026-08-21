// utils/formatter.ts

export const formatSensorValue = (key: string, value: number) => {
  // Rumus simulasi inverse transform (mengembalikan nilai asli)
  switch (key) {
    case 'type':
      return value < -1 ? 'Low' : value > 0.5 ? 'High' : 'Medium';
    case 'air_temperature':
      return `${(value * 5 + 30).toFixed(1)} °C`; // Asumsi rentang 25-35 °C
    case 'process_temperature':
      return `${(value * 10 + 45).toFixed(1)} °C`; // Asumsi rentang 35-55 °C
    // case 'air_temperature':
    //   return `${(value * 5 + 303.15).toFixed(1)} K`; // Asumsi rentang 298.15 - 308.15 K
    // case 'process_temperature':
    //   return `${(value * 10 + 318.15).toFixed(1)} K`; // Asumsi rentang 308.15 - 328.15 K
    case 'rotational_speed':
      return `${(value * 300 + 1500).toFixed(0)} RPM`; // Asumsi putaran 1200-1800 RPM
    case 'torque':
      return `${(value * 15 + 40).toFixed(1)} Nm`; // Asumsi torsi 25-55 Nm
    case 'tool_wear':
      return `${Math.abs(value * 50 + 100).toFixed(0)} Menit`; // Asumsi waktu aus
    default:
      return String(value);
  }
};

export const formatLabel = (key: string) => {
  return key.replace('_', ' ').toUpperCase();
};