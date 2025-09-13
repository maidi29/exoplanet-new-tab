import React, {useEffect, useState, useRef} from 'react';
import './Planet.scss';
import {getRandomElement, randomIntFromInterval} from "../../services/helpers";
import {PlanetTextures} from "../../constants/planetTextures";
import {Exoplanet, PlanetTypes} from "../../models/exoplanet.model";

export const Planet = ({planet}: {planet: Exoplanet}) => {
    const target = React.useRef<HTMLDivElement>(null)
    const surfaceRef = useRef<string>(planet.pl_type ? getRandomElement(PlanetTextures[planet.pl_type as PlanetTypes]) : getRandomElement(PlanetTextures[PlanetTypes.UNKNOWN]));

    const [style, setStyle] = useState<React.CSSProperties>({
        "--planet-texture": `url(/images/${surfaceRef.current})`,
        "--planet-color-r": randomIntFromInterval(0,255),
        "--planet-color-g": randomIntFromInterval(0,255),
        "--planet-color-b": randomIntFromInterval(0,255),
        "--planet-tilt": `${randomIntFromInterval(0,35)}deg`,
        "--rotate-speed": `${randomIntFromInterval(15,35)}s`,
        "--shadow-width":`${randomIntFromInterval(-110,-60)}px`
    } as React.CSSProperties);

    useEffect(() => {
        surfaceRef.current = planet.pl_type ? getRandomElement(PlanetTextures[planet.pl_type as PlanetTypes]) : getRandomElement(PlanetTextures[PlanetTypes.UNKNOWN]);
        setStyle(prevStyle => Object.assign({}, prevStyle, {"--planet-texture": `url(/images/${surfaceRef.current})`}));
    },[planet]);

    return (
      <div className="planet" style={style} ref={target}>
          <div className="planet__atmosphere">
            <div className="planet__surface"/>
          </div>
      </div>
  );
}
