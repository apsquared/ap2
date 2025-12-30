/**
 * Mapping of county names to their property assessor website URLs
 */
export const COUNTY_ASSESSOR_URLS: Record<string, string> = {
  'Monroe': 'http://agencies.monroecountypa.gov/monroepa_prod/search/commonsearch.aspx?mode=address',
  'Carbon': 'https://carbon-county-open-data-portal-carbongis.hub.arcgis.com/',
};

/**
 * Get the assessor URL for a given county name
 * @param county - The county name (case-insensitive)
 * @returns The assessor URL if found, undefined otherwise
 */
export function getAssessorUrl(county: string): string | undefined {
  if (!county) return undefined;
  
  // Try exact match first
  if (COUNTY_ASSESSOR_URLS[county]) {
    return COUNTY_ASSESSOR_URLS[county];
  }
  
  // Try case-insensitive match
  const countyKey = Object.keys(COUNTY_ASSESSOR_URLS).find(
    key => key.toLowerCase() === county.toLowerCase()
  );
  
  return countyKey ? COUNTY_ASSESSOR_URLS[countyKey] : undefined;
}

