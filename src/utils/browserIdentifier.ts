const hashString = (str: string): string => {
  // Fonction de hachage simple mais efficace
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir en entier 32 bits
  }
  return Math.abs(hash).toString(36);
};

const getHardwareInfo = (): string => {
  // Informations matérielles qui ne peuvent pas être modifiées facilement
  const hardwareData = {
    // CPU et Mémoire
    cpuCores: navigator.hardwareConcurrency,
    deviceMemory: (navigator as any).deviceMemory,
    
    // Écran physique (ne change pas même avec un autre navigateur)
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    screenDepth: window.screen.colorDepth,
    screenPR: window.devicePixelRatio,
    
    // Système d'exploitation et architecture
    platform: navigator.platform,
    oscpu: (navigator as any).oscpu,
    architecture: (navigator as any).cpuClass || '',
    
    // Caractéristiques matérielles détaillées
    maxTouchPoints: navigator.maxTouchPoints,
    devicePixelRatio: window.devicePixelRatio,
    colorGamut: (matchMedia('(color-gamut: srgb)').matches ? 'srgb' : 
                 matchMedia('(color-gamut: p3)').matches ? 'p3' : 
                 matchMedia('(color-gamut: rec2020)').matches ? 'rec2020' : ''),
    
    // Capacités matérielles
    hdr: matchMedia('(dynamic-range: high)').matches,
    contrast: matchMedia('(prefers-contrast: high)').matches,
    
    // Informations système
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),
    
    // Caractéristiques de l'écran
    screenOrientation: screen.orientation?.type || '',
    screenAvailWidth: screen.availWidth,
    screenAvailHeight: screen.availHeight,
    
    // Informations sur les performances
    memory: (performance as any).memory?.jsHeapSizeLimit || '',
  };

  // WebGL pour identifier la carte graphique
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        hardwareData['gpuVendor'] = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        hardwareData['gpuRenderer'] = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        hardwareData['gpuVersion'] = gl.getParameter(gl.VERSION);
        hardwareData['gpuShadingLanguageVersion'] = gl.getParameter(gl.SHADING_LANGUAGE_VERSION);
      }
    }
  } catch (e) {
    console.error('Erreur lors de la récupération des infos WebGL:', e);
  }

  // Créer une empreinte unique basée sur le matériel
  return hashString(JSON.stringify(hardwareData));
};

const getWebGLInfo = () => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        return {
          vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
          renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        };
      }
    }
  } catch (e) {
    console.error('Erreur WebGL:', e);
  }
  return { vendor: '', renderer: '' };
};

export const getBrowserId = (pollId: string) => {
  const webgl = getWebGLInfo();
  const data = {
    userAgent: navigator.userAgent,
    acceptLanguage: navigator.languages.join(','),
    timestamp: new Date().toISOString(),
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    platform: navigator.platform,
    webglVendor: webgl.vendor,
    webglRenderer: webgl.renderer,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: (navigator as any).deviceMemory,
    colorDepth: window.screen.colorDepth,
    touchPoints: navigator.maxTouchPoints,
    languages: navigator.languages.join(','),
    pollId // Ajouter l'ID du sondage
  };

  return hashString(JSON.stringify(data));
}; 