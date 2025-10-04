import { Exoplanet, PlanetTypes } from "../models/exoplanet.model";
import { formatDecimal } from "./helpers";

const MAX_SUBTITLE_LENGTH = 75;
const MAX_DESCRIPTION_LENGTH = 1000;
const MIN_DESCRIPTION_LENGTH = 10;

const JUPITER_MASS = 317.8;
const JUPITER_RADIUS = 11.2;

const fetchWikipediaDescription = async (planetName: string): Promise<{description: string | null, subtitle: string | null}> => {
    try {
        const cleanName = planetName.replace(/[^a-zA-Z0-9\s-]/g, '').trim();
        const searchResponse = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanName)}?origin=*`
        );
        if (!searchResponse.ok) return {description: null, subtitle: null};
        const data = await searchResponse.json();
        
        let description = null;
        let subtitle = null;
        
        if (data.description && data.description.length > 0) {
            subtitle = data.description;
            if (subtitle.length > MAX_SUBTITLE_LENGTH) {
                subtitle = subtitle.substring(0, MAX_SUBTITLE_LENGTH) + '...';
            }
        }
        
        if (data.extract && data.extract.length > MIN_DESCRIPTION_LENGTH) {
            description = data.extract.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
            if (description.length > MAX_DESCRIPTION_LENGTH) {
                description = description.substring(0, MAX_DESCRIPTION_LENGTH) + '...';
            }
        }
        
        return {description, subtitle};
    } catch (error) {
        return {description: null, subtitle: null};
    }
};

// internal only
const classifyPlanetType = (planet: Exoplanet): PlanetTypes => {
    const mass = planet.pl_masse || 0;
    const radius = planet.pl_rade || 0;
    
    const massInJupiter = mass / JUPITER_MASS;
    const radiusInJupiter = radius / JUPITER_RADIUS;
    
    if (massInJupiter >= 0.1 && radiusInJupiter >= 0.5) {
        return PlanetTypes.GAS_GIANT;
    } else if (massInJupiter >= 0.05 && massInJupiter < 0.1) {
        return PlanetTypes.NEPTUNIAN;
    } else if (massInJupiter >= 0.01 && massInJupiter < 0.05) {
        return PlanetTypes.SUPER_EARTH;
    } else if (massInJupiter < 0.01 && radiusInJupiter < 0.5) {
        return PlanetTypes.TERRESTRIAL;
    }
    
    return PlanetTypes.UNKNOWN;
};

export const fetchExoplanets = () => {
    fetch('https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=select+pl_name,pl_rade,pl_orbper,pl_masse,sy_snum,sy_dist,pl_eqt,pl_refname,disc_year,sy_snum+from+ps+where+pl_masse+%3E0+and+pl_rade+%3E+0+and+pl_orbper+%3E+0+and+sy_dist+%3E+0+and+pl_eqt+between+-300+and+10000&format=csv')
        .then(r => r.text()).then(result => {
            const resultObject = csvToJson(result);
            
            resultObject.forEach((planet, index) => {
                resultObject[index].pl_type = classifyPlanetType(planet);
            });
            
            chrome.storage.local.set({allExoplanets: JSON.stringify(resultObject)});
            
            resultObject.forEach((planet, index) => {
                fetchWikipediaDescription(planet.pl_name)
                    .then(({description, subtitle}) => {
                        if (description) {
                            resultObject[index].pl_desc = description;
                        }
                        if (subtitle) {
                            resultObject[index].pl_subtitle = subtitle;
                        }
                        if (description || subtitle) {
                            chrome.storage.local.set({allExoplanets: JSON.stringify(resultObject)});
                        }
                    })
                    .catch(error => {});
            });
    });
}

const csvToJson = (csv: string): Exoplanet[] => {
    const lines = csv.split("\n");
    const headers = lines[0].split(",");
    const result = lines.reduce((element, line, index) => {
        if (index !== 0 && index !== lines.length-1) {
            let planet = {};
            const currentLine = line.split(",");
            headers.forEach((prop: string, propIndex: number) => {
                // @ts-ignore
                planet[prop] = currentLine[propIndex];
            })
            element.push(planet);
        }
        return element;
    }, Array.prototype);

    return result as Exoplanet[];
}

export const transformValues = (planet: Exoplanet): Exoplanet => {
    return Object.assign({}, planet, {
        pl_name: planet.pl_name.replaceAll('"',''),
        pl_refname: planet.pl_refname.replaceAll('"',''),
        pl_rade: formatDecimal(+planet.pl_rade),
        pl_orbper: formatDecimal(+planet.pl_orbper, 1),
        pl_masse: formatDecimal(+planet.pl_masse),
        sy_dist: formatDecimal(parsecToLightYear(+planet.sy_dist), 0),
        pl_eqt: formatDecimal(kelvinToCelsius(+planet.pl_eqt),0),
        pl_eqt_f: formatDecimal(celsiusToFahrenheit(kelvinToCelsius(+planet.pl_eqt)),0),
        sy_snum: +planet.sy_snum,
        pl_type: planet.pl_type ? planet.pl_type : PlanetTypes.UNKNOWN,
    });
}

const parsecToLightYear = (parsec: number) => parsec * 3.2616;
const kelvinToCelsius = (kelvin: number): number => kelvin - 273.15;
const celsiusToFahrenheit = (celsius: number): number => celsius * 9 / 5 + 32;
