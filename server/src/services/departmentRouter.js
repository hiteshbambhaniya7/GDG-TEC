export const DEPARTMENTS = {
  ROADS: 'Roads & Infrastructure',
  SANITATION: 'Sanitation',
  ELECTRICAL: 'Electrical',
  WATER: 'Water Supply',
  DRAINAGE: 'Drainage',
  TRAFFIC: 'Traffic',
  GARDEN: 'Garden & Environment',
  PUBLIC_PROPERTY: 'Public Property'
};

export const CATEGORIES = {
  ROAD_POTHOLE: 'Road & Pothole',
  GARBAGE_SANITATION: 'Garbage & Sanitation',
  STREETLIGHT: 'Streetlight',
  WATER_LEAKAGE: 'Water Leakage',
  DRAINAGE: 'Drainage',
  TRAFFIC_SIGNAL: 'Traffic Signal',
  PUBLIC_PROPERTY: 'Public Property',
  TREE_ENVIRONMENT: 'Tree & Environment',
  OTHER: 'Other'
};

export const CATEGORY_DEPARTMENT_MAP = {
  'Road & Pothole': 'Roads & Infrastructure',
  'Garbage & Sanitation': 'Sanitation',
  'Streetlight': 'Electrical',
  'Water Leakage': 'Water Supply',
  'Drainage': 'Drainage',
  'Traffic Signal': 'Traffic',
  'Public Property': 'Public Property',
  'Tree & Environment': 'Garden & Environment',
  'Other': 'Sanitation'
};

export const BHAVNAGAR_WARDS = [
  'Ward 1 - Kaliyabid',
  'Ward 2 - Waghawadi Road & Takhteshwar',
  'Ward 3 - Nilambag & Ghogha Circle',
  'Ward 4 - Chitra GIDC & Subhashnagar',
  'Ward 5 - Sardarnagar & Bharatnagar',
  'Ward 6 - Rupani & Vidhyanagar',
  'Ward 7 - Kalanala & Crescent Circle',
  'Ward 8 - Anandnagar & Kumbharwada',
  'Ward 9 - Sidsar & Akwada Lake Area',
  'Ward 10 - Ruva & Nari Road'
];

export const routeCategoryToDepartment = (category, description = '') => {
  if (category && CATEGORY_DEPARTMENT_MAP[category]) {
    return CATEGORY_DEPARTMENT_MAP[category];
  }

  const text = `${category || ''} ${description || ''}`.toLowerCase();

  if (
    text.includes('pothole') ||
    text.includes('road') ||
    text.includes('footpath') ||
    text.includes('asphalt') ||
    text.includes('speed breaker') ||
    text.includes('bridge')
  ) {
    return DEPARTMENTS.ROADS;
  }

  if (
    text.includes('garbage') ||
    text.includes('waste') ||
    text.includes('trash') ||
    text.includes('dustbin') ||
    text.includes('dump') ||
    text.includes('kachra') ||
    text.includes('sweep')
  ) {
    return DEPARTMENTS.SANITATION;
  }

  if (
    text.includes('light') ||
    text.includes('lamp') ||
    text.includes('pole') ||
    text.includes('dark') ||
    text.includes('electric') ||
    text.includes('wire') ||
    text.includes('spark')
  ) {
    return DEPARTMENTS.ELECTRICAL;
  }

  if (
    text.includes('drinking water') ||
    text.includes('pipeline') ||
    text.includes('water leak') ||
    text.includes('water supply') ||
    text.includes('water pressure')
  ) {
    return DEPARTMENTS.WATER;
  }

  if (
    text.includes('drainage') ||
    text.includes('sewage') ||
    text.includes('manhole') ||
    text.includes('gutter') ||
    text.includes('drain') ||
    text.includes('overflow')
  ) {
    return DEPARTMENTS.DRAINAGE;
  }

  if (
    text.includes('traffic') ||
    text.includes('signal') ||
    text.includes('blinker') ||
    text.includes('zebra') ||
    text.includes('road sign')
  ) {
    return DEPARTMENTS.TRAFFIC;
  }

  if (
    text.includes('tree') ||
    text.includes('branch') ||
    text.includes('garden') ||
    text.includes('park') ||
    text.includes('greenery')
  ) {
    return DEPARTMENTS.GARDEN;
  }

  if (
    text.includes('encroach') ||
    text.includes('illegal stall') ||
    text.includes('railing') ||
    text.includes('bus stop') ||
    text.includes('property')
  ) {
    return DEPARTMENTS.PUBLIC_PROPERTY;
  }

  return DEPARTMENTS.ROADS;
};
