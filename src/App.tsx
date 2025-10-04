import React, { useEffect } from 'react';
import './App.scss';
import { Exoplanet } from "./models/exoplanet.model";
import { getRandomElement } from "./services/helpers";
import { Planet } from "./components/Planet/Planet";
import { Info } from "./components/Info/Info";
import { Sun } from "./components/Sun/Sun";
import { transformValues } from "./services/fetch-and-process";
import { DefaultPlanets } from "./constants/defaults";

export const App = () => {
    const [planet, setPlanet] = React.useState<Exoplanet>();
    const [suns, setSuns] = React.useState<Array<string>>(['']);

    useEffect(()=> {
        if (chrome?.storage?.local) {
            chrome.storage.local.get(['allExoplanets'], (result) => {
                if (result.allExoplanets) {
                    const randomPlanet = transformValues(getRandomElement(JSON.parse(result.allExoplanets)));
                    setPlanet(randomPlanet);
                } else {
                    setPlanet(getRandomElement(DefaultPlanets));
                }
            });
        } else {
            setPlanet(getRandomElement(DefaultPlanets));
        }
    },[]);

    useEffect( ()=> {
        setSuns(new Array(planet?.sy_snum).fill(''));
        },[planet]
    );


  return (
    <div className="sky" >
      <div className="stars small"/>
      <div className="stars medium"/>
      <div className="stars large"/>
      {suns?.map((_value, index)=>
          (<Sun key={index} index={index}/>)
      )}
      {planet && <Planet planet={planet}/>}
      {planet && <Info planet={planet}/>}
    </div>
  );
}
