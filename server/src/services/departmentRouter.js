export const DEPARTMENTS = {
  ROADS: 'Roads & Buildings (PWD)',
  SOLID_WASTE: 'Solid Waste Management',
  WATER_DRAINAGE: 'Water Works & Drainage',
  ELECTRICAL: 'Electrical & Street Lighting',
  HEALTH: 'Health & Sanitation',
  ENCROACHMENT: 'Encroachment & Animal Control',
  HORTICULTURE: 'Horticulture & Parks',
  GENERAL: 'General Administration'
};

export const BHAVNAGAR_WARDS = [
  'Ward 1 - Kaliyabid & Hill Drive',
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
  const text = `${category} ${description}`.toLowerCase();

  if (
    text.includes('pothole') ||
    text.includes('road') ||
    text.includes('footpath') ||
    text.includes('divider') ||
    text.includes('asphalt') ||
    text.includes('speed breaker')
  ) {
    return DEPARTMENTS.ROADS;
  }

  if (
    text.includes('garbage') ||
    text.includes('waste') ||
    text.includes('trash') ||
    text.includes('dustbin') ||
    text.includes('dump') ||
    text.includes('plastic') ||
    text.includes('kachra')
  ) {
    return DEPARTMENTS.SOLID_WASTE;
  }

  if (
    text.includes('water') ||
    text.includes('leak') ||
    text.includes('drainage') ||
    text.includes('sewage') ||
    text.includes('manhole') ||
    text.includes('pipeline') ||
    text.includes('gutter') ||
    text.includes('drain')
  ) {
    return DEPARTMENTS.WATER_DRAINAGE;
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
    text.includes('cow') ||
    text.includes('cattle') ||
    text.includes('dog') ||
    text.includes('stray') ||
    text.includes('animal') ||
    text.includes('encroach') ||
    text.includes('hawker')
  ) {
    return DEPARTMENTS.ENCROACHMENT;
  }

  if (
    text.includes('mosquito') ||
    text.includes('dengue') ||
    text.includes('malaria') ||
    text.includes('stench') ||
    text.includes('smell') ||
    text.includes('epidemic') ||
    text.includes('sanitation')
  ) {
    return DEPARTMENTS.HEALTH;
  }

  if (
    text.includes('tree') ||
    text.includes('branch') ||
    text.includes('garden') ||
    text.includes('park') ||
    text.includes('plants')
  ) {
    return DEPARTMENTS.HORTICULTURE;
  }

  return DEPARTMENTS.GENERAL;
};
