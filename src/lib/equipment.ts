// Equipment fields on the user profile. Shared by the profile form, the save action
// and the admin user export, so the three never drift apart.

export const EQUIPMENT_FIELDS = [
  { key: 'cameraModel', label: 'Kamera, modell', placeholder: 'Canon R6 mark ii' },
  { key: 'lens1', label: 'Objektiv 1, modell, brennvidde og blender', placeholder: 'Canon EF 17-35 f.2,8' },
  { key: 'lens2', label: 'Objektiv 2, modell, brennvidde og blender', placeholder: 'Canon EF 17-35 f.2,8' },
  { key: 'droneModel', label: 'Drone', placeholder: 'DJI Mini 5 Pro' },
  { key: 'phoneModel', label: 'Telefonmodell', placeholder: 'Apple iPhone 17Pro' },
] as const;

export type EquipmentKey = (typeof EQUIPMENT_FIELDS)[number]['key'];
export type Equipment = Record<EquipmentKey, string>;
export const EQUIPMENT_MAX = 120;
