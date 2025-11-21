// Featured 3D Car Models Catalog
// These are curated high-quality STL models available for purchase/download

export interface FeaturedModel {
  id: string;
  name: string;
  category: 'classic' | 'modern' | 'supercar' | 'racing' | 'vintage';
  brand: string;
  year: string;
  scale: string;
  price: number;
  originalPrice?: number;
  stlUrl: string;
  previewUrl?: string;
  thumbnailUrl?: string;
  fileSize: string;
  printTime: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  vertices: number;
  polygons: number;
  dimensions: {
    x: number;
    y: number;
    z: number;
    unit: 'mm';
  };
  description: string;
  features: string[];
  tags: string[];
  license: 'personal' | 'commercial' | 'attribution';
  source?: string;
  popularity: number; // 1-5 rating
  downloads?: number;
}

// Best STL car models from various sources
// Sources: Thingiverse, CGTrader, Cults3D, MyMiniFactory, Printables
// IMPORTANT: These are placeholder paths. To get REAL STL files:
// 1. Run: chmod +x download-models.sh && ./download-models.sh
// 2. Or manually download from the links below and place in public/models/

// Real download links for each model:
const REAL_MODEL_SOURCES = {
  lamborghini: 'https://www.thingiverse.com/thing:1505677', // Free
  cybertruck: 'https://www.thingiverse.com/thing:3989993', // Free
  nissan_gtr: 'https://www.thingiverse.com/thing:3388553', // Free
  bmw_m3: 'https://www.thingiverse.com/thing:2829035', // Free
  porsche_911: 'https://www.printables.com/model/156891-porsche-911-gt3-rs', // Free
  mustang: 'https://www.thingiverse.com/thing:3619103', // Free
  ferrari: 'https://cults3d.com/en/3d-model/game/ferrari-458-italia', // Free
  mclaren: 'https://www.thingiverse.com/thing:4766566', // Free
};

export const featuredModels: FeaturedModel[] = [
  {
    id: 'fm-001',
    name: 'Lamborghini Aventador SVJ',
    category: 'supercar',
    brand: 'Lamborghini',
    year: '2019',
    scale: '1:24',
    price: 0, // FREE from Thingiverse
    originalPrice: 24.99,
    stlUrl: '/models/lamborghini-aventador.stl', // Download from link above
    fileSize: '42.3 MB',
    printTime: '8h 30min',
    difficulty: 'medium',
    vertices: 245000,
    polygons: 490000,
    dimensions: { x: 187, y: 82, z: 48, unit: 'mm' },
    description: 'Highly detailed Lamborghini Aventador SVJ with separate parts for wheels, spoiler, and body. Perfect for display or collection.',
    features: [
      'Separate wheel parts',
      'Detailed interior',
      'Opening doors (optional)',
      'High polygon count',
      'Printable without supports'
    ],
    tags: ['supercar', 'lamborghini', 'italian', 'v12', 'detailed'],
    license: 'personal',
    source: REAL_MODEL_SOURCES.lamborghini, // Actual download link
    popularity: 5,
    downloads: 1247
  },
  {
    id: 'fm-002',
    name: 'Porsche 911 GT3 RS',
    category: 'racing',
    brand: 'Porsche',
    year: '2023',
    scale: '1:18',
    price: 0, // FREE from Printables
    stlUrl: '/models/porsche-911-gt3rs.stl', // Download from link
    fileSize: '58.7 MB',
    printTime: '10h 15min',
    difficulty: 'hard',
    vertices: 312000,
    polygons: 624000,
    dimensions: { x: 250, y: 100, z: 72, unit: 'mm' },
    description: 'Track-focused Porsche 911 GT3 RS with aerodynamic details, including the distinctive rear wing and front splitter.',
    features: [
      'Accurate aero package',
      'Detailed brake discs',
      'Engine visible through rear',
      'Separate color parts',
      'Racing decals included'
    ],
    tags: ['porsche', 'racing', 'german', 'track', 'gt3'],
    license: 'commercial',
    popularity: 5,
    downloads: 892
  },
  {
    id: 'fm-003',
    name: 'Ford Mustang 1967 Fastback',
    category: 'classic',
    brand: 'Ford',
    year: '1967',
    scale: '1:24',
    price: 0, // FREE from Thingiverse
    stlUrl: '/models/ford-mustang-67.stl', // Download from link
    fileSize: '35.2 MB',
    printTime: '7h 45min',
    difficulty: 'easy',
    vertices: 186000,
    polygons: 372000,
    dimensions: { x: 195, y: 73, z: 56, unit: 'mm' },
    description: 'Iconic 1967 Ford Mustang Fastback, the Eleanor. A must-have for classic car enthusiasts.',
    features: [
      'Classic muscle car design',
      'Detailed chrome parts',
      'V8 engine detail',
      'Period-correct wheels',
      'Simple assembly'
    ],
    tags: ['mustang', 'muscle', 'classic', 'american', '1960s'],
    license: 'personal',
    popularity: 5,
    downloads: 2103
  },
  {
    id: 'fm-004',
    name: 'McLaren P1',
    category: 'supercar',
    brand: 'McLaren',
    year: '2015',
    scale: '1:24',
    price: 34.99,
    originalPrice: 49.99,
    stlUrl: '/models/mclaren-p1.stl',
    fileSize: '67.4 MB',
    printTime: '12h 20min',
    difficulty: 'expert',
    vertices: 428000,
    polygons: 856000,
    dimensions: { x: 188, y: 79, z: 47, unit: 'mm' },
    description: 'The legendary McLaren P1 hypercar with active aerodynamics and hybrid powertrain details.',
    features: [
      'Active rear wing',
      'DRS system detail',
      'Hybrid badges',
      'Carbon fiber texture',
      'Ultra-high detail'
    ],
    tags: ['mclaren', 'hypercar', 'hybrid', 'british', 'exclusive'],
    license: 'commercial',
    popularity: 5,
    downloads: 567
  },
  {
    id: 'fm-005',
    name: 'Ferrari F40',
    category: 'classic',
    brand: 'Ferrari',
    year: '1987',
    scale: '1:18',
    price: 27.99,
    stlUrl: '/models/ferrari-f40.stl',
    fileSize: '48.9 MB',
    printTime: '9h 30min',
    difficulty: 'medium',
    vertices: 298000,
    polygons: 596000,
    dimensions: { x: 246, y: 110, z: 63, unit: 'mm' },
    description: 'The last Ferrari personally approved by Enzo Ferrari. An 80s icon with twin-turbo V8.',
    features: [
      'Pop-up headlights',
      'Iconic rear spoiler',
      'Twin-turbo detail',
      'NACA ducts',
      'Lexan windows'
    ],
    tags: ['ferrari', 'classic', 'italian', '1980s', 'turbo'],
    license: 'personal',
    popularity: 5,
    downloads: 1567
  },
  {
    id: 'fm-006',
    name: 'Tesla Cybertruck',
    category: 'modern',
    brand: 'Tesla',
    year: '2024',
    scale: '1:32',
    price: 0, // FREE from Thingiverse
    stlUrl: '/models/tesla-cybertruck.stl', // This one works with the script!
    fileSize: '18.3 MB',
    printTime: '4h 15min',
    difficulty: 'easy',
    vertices: 45000,
    polygons: 90000,
    dimensions: { x: 175, y: 63, z: 56, unit: 'mm' },
    description: 'The revolutionary Tesla Cybertruck with its distinctive angular, stainless steel design.',
    features: [
      'Simple geometric design',
      'No support needed',
      'Vault bed detail',
      'Armor glass windows',
      'Easy printing'
    ],
    tags: ['tesla', 'electric', 'truck', 'futuristic', 'angular'],
    license: 'commercial',
    popularity: 4,
    downloads: 3421
  },
  {
    id: 'fm-007',
    name: 'Bugatti Chiron',
    category: 'supercar',
    brand: 'Bugatti',
    year: '2020',
    scale: '1:24',
    price: 39.99,
    stlUrl: '/models/bugatti-chiron.stl',
    fileSize: '71.2 MB',
    printTime: '14h 45min',
    difficulty: 'expert',
    vertices: 512000,
    polygons: 1024000,
    dimensions: { x: 186, y: 80, z: 48, unit: 'mm' },
    description: 'The ultimate expression of luxury and speed. 1500hp W16 quad-turbo engineering marvel.',
    features: [
      'C-line detail',
      'Quad exhaust',
      'W16 engine visible',
      'Horseshoe grille',
      'Premium detail level'
    ],
    tags: ['bugatti', 'hypercar', 'luxury', 'w16', 'french'],
    license: 'personal',
    popularity: 5,
    downloads: 423
  },
  {
    id: 'fm-008',
    name: 'BMW M3 E30',
    category: 'classic',
    brand: 'BMW',
    year: '1990',
    scale: '1:24',
    price: 22.99,
    stlUrl: '/models/bmw-m3-e30.stl',
    fileSize: '38.6 MB',
    printTime: '8h 00min',
    difficulty: 'medium',
    vertices: 224000,
    polygons: 448000,
    dimensions: { x: 177, y: 68, z: 55, unit: 'mm' },
    description: 'The original M3 that started it all. DTM homologation special with box flares and rear wing.',
    features: [
      'DTM box flares',
      'Evo wing',
      'BBS wheels style',
      'S14 engine detail',
      'Racing heritage'
    ],
    tags: ['bmw', 'm3', 'dtm', 'classic', 'german'],
    license: 'commercial',
    popularity: 5,
    downloads: 1789
  },
  {
    id: 'fm-009',
    name: 'Nissan GT-R R35 Nismo',
    category: 'modern',
    brand: 'Nissan',
    year: '2022',
    scale: '1:24',
    price: 0, // FREE from Thingiverse  
    stlUrl: '/models/nissan-gtr-nismo.stl', // Download from link
    fileSize: '52.8 MB',
    printTime: '10h 30min',
    difficulty: 'hard',
    vertices: 342000,
    polygons: 684000,
    dimensions: { x: 188, y: 77, z: 54, unit: 'mm' },
    description: 'Godzilla in its ultimate Nismo form. Japanese engineering at its finest with 600hp twin-turbo V6.',
    features: [
      'Nismo body kit',
      'Carbon fiber parts',
      'GT3 inspired aero',
      'Detailed underfloor',
      'ATTESA AWD detail'
    ],
    tags: ['nissan', 'gtr', 'jdm', 'nismo', 'godzilla'],
    license: 'personal',
    popularity: 5,
    downloads: 2234
  },
  {
    id: 'fm-010',
    name: 'Aston Martin DB5',
    category: 'vintage',
    brand: 'Aston Martin',
    year: '1964',
    scale: '1:18',
    price: 31.99,
    stlUrl: '/models/aston-martin-db5.stl',
    fileSize: '44.7 MB',
    printTime: '9h 15min',
    difficulty: 'medium',
    vertices: 276000,
    polygons: 552000,
    dimensions: { x: 258, y: 97, z: 72, unit: 'mm' },
    description: 'The most famous car in the world - James Bond\'s DB5. British elegance and sophistication.',
    features: [
      'Wire wheels',
      'Classic grille',
      'Detailed interior',
      'Opening parts option',
      'Display base included'
    ],
    tags: ['aston', 'british', 'classic', 'bond', 'luxury'],
    license: 'commercial',
    popularity: 5,
    downloads: 1123
  },
  
  // GTA Online Car Pack - REAL STL FILES LOADED!
  {
    id: 'gta-001',
    name: 'Progen T20 (GTA Online)',
    category: 'supercar',
    brand: 'GTA Online',
    year: '2015',
    scale: '1:24',
    price: 0, // FREE - Already downloaded!
    stlUrl: '/models/gta-progen-t20.stl', // REAL FILE - 1.2MB
    fileSize: '1.2 MB',
    printTime: '3h 30min',
    difficulty: 'easy',
    vertices: 30000,
    polygons: 60000,
    dimensions: { x: 180, y: 75, z: 45, unit: 'mm' },
    description: 'GTA Online\'s Progen T20 - Based on McLaren P1. One of the fastest cars in Los Santos.',
    features: [
      'Low poly design',
      'No supports needed',
      'Quick print',
      'Game accurate',
      'Perfect for gaming fans'
    ],
    tags: ['gta', 'gaming', 'mclaren', 'supercar', 'low-poly'],
    license: 'personal',
    source: 'https://www.thingiverse.com/thing:3587480',
    popularity: 5,
    downloads: 5234
  },
  {
    id: 'gta-002',
    name: 'Pegassi Zentorno',
    category: 'supercar',
    brand: 'GTA Online',
    year: '2014',
    scale: '1:24',
    price: 0, // FREE
    stlUrl: '/models/gta-pegassi-zentorno.stl', // REAL FILE - 1.8MB
    fileSize: '1.8 MB',
    printTime: '4h 15min',
    difficulty: 'easy',
    vertices: 45000,
    polygons: 90000,
    dimensions: { x: 185, y: 80, z: 42, unit: 'mm' },
    description: 'Pegassi Zentorno - Inspired by Lamborghini Sesto Elemento. Angular hypercar from GTA Online.',
    features: [
      'Aggressive styling',
      'Sharp edges',
      'Printable design',
      'No assembly required',
      'Iconic GTA vehicle'
    ],
    tags: ['gta', 'lamborghini', 'zentorno', 'gaming', 'hypercar'],
    license: 'personal',
    popularity: 5,
    downloads: 4123
  },
  {
    id: 'gta-003',
    name: 'Annis Elegy Retro Custom',
    category: 'racing',
    brand: 'GTA Online',
    year: '2017',
    scale: '1:24',
    price: 0, // FREE
    stlUrl: '/models/gta-elegy-retro.stl', // REAL FILE - 4.7MB
    fileSize: '4.7 MB',
    printTime: '6h 30min',
    difficulty: 'medium',
    vertices: 118000,
    polygons: 236000,
    dimensions: { x: 175, y: 72, z: 48, unit: 'mm' },
    description: 'Elegy Retro Custom - The Nissan Skyline GT-R of GTA. JDM legend in Los Santos.',
    features: [
      'JDM styling',
      'Detailed body',
      'Benny\'s custom',
      'R32 inspired',
      'Street racing icon'
    ],
    tags: ['gta', 'nissan', 'skyline', 'jdm', 'tuner'],
    license: 'personal',
    popularity: 5,
    downloads: 6789
  },
  {
    id: 'gta-004',
    name: 'Grotti Turismo R',
    category: 'supercar',
    brand: 'GTA Online',
    year: '2014',
    scale: '1:24',
    price: 0, // FREE
    stlUrl: '/models/gta-turismo-r.stl', // REAL FILE - 1.9MB
    fileSize: '1.9 MB',
    printTime: '4h 45min',
    difficulty: 'easy',
    vertices: 49000,
    polygons: 98000,
    dimensions: { x: 182, y: 78, z: 44, unit: 'mm' },
    description: 'Turismo R - GTA\'s take on Ferrari LaFerrari. Italian hypercar excellence.',
    features: [
      'Ferrari inspired',
      'Sleek design',
      'Hybrid hypercar',
      'Easy print',
      'Smooth curves'
    ],
    tags: ['gta', 'ferrari', 'italian', 'hypercar', 'gaming'],
    license: 'personal',
    popularity: 5,
    downloads: 3456
  },
  {
    id: 'gta-005',
    name: 'Vapid FMJ',
    category: 'supercar',
    brand: 'GTA Online',
    year: '2016',
    scale: '1:24',
    price: 0, // FREE
    stlUrl: '/models/gta-vapid-fmj.stl', // REAL FILE - 8.4MB!
    fileSize: '8.4 MB',
    printTime: '10h 30min',
    difficulty: 'hard',
    vertices: 212000,
    polygons: 424000,
    dimensions: { x: 188, y: 82, z: 43, unit: 'mm' },
    description: 'Vapid FMJ - Based on Ford GT 2017. American supercar engineering at its finest.',
    features: [
      'Highly detailed',
      'Ford GT inspired',
      'Aerodynamic design',
      'Race heritage',
      'Complex geometry'
    ],
    tags: ['gta', 'ford', 'american', 'supercar', 'lemans'],
    license: 'personal',
    popularity: 5,
    downloads: 2890
  },
  {
    id: 'gta-006',
    name: 'Pfister 811',
    category: 'supercar',
    brand: 'GTA Online',
    year: '2016',
    scale: '1:24',
    price: 0, // FREE
    stlUrl: '/models/gta-pfister-811.stl', // REAL FILE - 6.6MB
    fileSize: '6.6 MB',
    printTime: '8h 15min',
    difficulty: 'medium',
    vertices: 167000,
    polygons: 334000,
    dimensions: { x: 184, y: 79, z: 45, unit: 'mm' },
    description: 'Pfister 811 - Porsche 918 Spyder in GTA form. German hybrid hypercar.',
    features: [
      'Porsche inspired',
      'Detailed model',
      'Hybrid hypercar',
      'Top speed machine',
      'Premium detail'
    ],
    tags: ['gta', 'porsche', 'german', 'hybrid', '918'],
    license: 'personal',
    popularity: 5,
    downloads: 2345
  }
];

// Get featured models for homepage
export const getFeaturedModels = (limit: number = 3) => {
  return featuredModels
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
};

// Get models by category
export const getModelsByCategory = (category: string) => {
  return featuredModels.filter(model => model.category === category);
};

// Get best sellers (most downloaded)
export const getBestSellers = (limit: number = 5) => {
  return featuredModels
    .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
    .slice(0, limit);
};

// Calculate total price for cart
export const calculateDiscount = (model: FeaturedModel) => {
  if (model.originalPrice) {
    return Math.round(((model.originalPrice - model.price) / model.originalPrice) * 100);
  }
  return 0;
};
