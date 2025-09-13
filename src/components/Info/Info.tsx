import React from 'react';
import './Info.scss';
import {Exoplanet, PlanetTypes} from "../../models/exoplanet.model";
import parse from 'html-react-parser';
import ReactTooltip from "react-tooltip";
import { usePersistentState } from '../../hooks/usePersistentState';

const typeDesc = {
    [PlanetTypes.GAS_GIANT]: "A gas giant is a large planet mostly composed of helium and/or hydrogen. These planets, " +
        "like Jupiter and Saturn in our solar system, don’t have hard surfaces and instead have swirling gases above a solid " +
        "core. Gas giant exoplanets can be much larger than Jupiter, and much closer to their stars than anything found in our solar system.",
    [PlanetTypes.NEPTUNE_LIKE]: "Neptunian exoplanets are similar in size to Neptune or Uranus in our solar system. Neptunian " +
        "planets typically have hydrogen and helium-dominated atmospheres with cores or rock and heavier metals.",
    [PlanetTypes.TERRESTRIAL]: "In our solar system, Earth, Mars, Mercury and Venus are terrestrial, or rocky, planets. For " +
        "planets outside our solar system, those between half of Earth’s size to twice its radius are considered terrestrial and " +
        "others may be even smaller. Exoplanets twice the size of Earth and larger may be rocky as well, but those are considered super-Earths.",
    [PlanetTypes.SUPER_EARTH]: "Super-Earths — a class of planets unlike any in our solar system — are more massive than " +
        "Earth yet lighter than ice giants like Neptune and Uranus, and can be made of gas, rock or a combination of both. " +
        "They are between twice the size of Earth and up to 10 times its mass.",
    [PlanetTypes.UNKNOWN]: ""
}


const Chevron = ({open}: {open: boolean}) => (
  <span className={`info__chevron ${open ? 'open' : ''}`}>›</span>
);

interface SectionProps {
  id: string;
  label: string | React.ReactNode;
  value?: React.ReactNode;
  children?: React.ReactNode;
  defaultOpen?: boolean;
}

const Section = ({id, label, value, children, defaultOpen = false}: SectionProps) => {
  const [open, setOpen] = usePersistentState<boolean>(`info.section.${id}`, defaultOpen);
  return (
    <div className="info__section">
      <button className="info__header" onClick={() => setOpen(!open)} aria-expanded={open}>
        <div>{label}</div>
        {value !== undefined && <div className="info__value">{value}</div>}
        <Chevron open={open} />
      </button>
      {open && children && <div className="info__content">{children}</div>}
    </div>
  );
};

export const Info = ({planet}: {planet: Exoplanet}) => {
  const [tempUnit, setTempUnit] = usePersistentState<'C' | 'F'>('info.tempUnit', 'C');
  const temperatureValue = tempUnit === 'C' ? `${planet.pl_eqt} °C` : `${planet.pl_eqt_f} °F`;

  return (
    <div className='info'>
      <div className='info--name'>{planet.pl_name}</div>
      {planet.pl_subtitle && !planet.pl_desc && (<div className='info--subtitle'>{planet.pl_subtitle}</div>)}

      {planet.pl_desc && (
        <Section id="description" label={<span className='info--subtitle'>{planet.pl_subtitle || "Description"}</span>} defaultOpen={true}>
          <div className='info__text'>{planet.pl_desc}</div>
        </Section>
      )}

      {/* Facts */}
      <Section 
        id="facts" 
        label={planet.pl_type ? (
          <div className='info__planet-type-header'>
             <button className='info__icon' data-tip data-for='planetType' aria-label='Info about planet type'>i</button>
            <span className='info__planet-type-label'>{planet.pl_type}</span>
           
          </div>
        ) : <span className='info--subtitle'>Facts</span>}
        defaultOpen={true}
      >
        <div className='info__facts'>

          {/* Size | Mass */}
          <div className='info__facts-row'>
            <div className='info__fact'>
              <span className='info__fact-value'><strong>{planet.pl_rade}</strong> Earths</span>
              <img src='/icons/size.png' alt='Size' className='info__fact-icon' data-tip data-for='sizeInfo'/>
              <ReactTooltip id='sizeInfo' className='info__tooltip' place='left' effect='solid' delayHide={150}>
                Planet radius relative to Earth
              </ReactTooltip>
            </div>
            <div className='info__fact'>
              <span className='info__fact-value'><strong>{planet.pl_masse}</strong> Earths</span>
              <img src='/icons/mass.png' alt='Mass' className='info__fact-icon' data-tip data-for='massInfo'/>
              <ReactTooltip id='massInfo' className='info__tooltip' place='left' effect='solid' delayHide={150}>
                Planet mass relative to Earth
              </ReactTooltip>
            </div>
          </div>

          {/* Temperature */}
          <div className='info__facts-row info__facts-row--full'>
            <div className='info__fact'>
              <span className='info__temp-click' data-tip data-for='tempUnit' data-event='click'>
                <strong>{temperatureValue}</strong>
              </span>
              <img src='/icons/temperature.png' alt='Temperature' className='info__fact-icon' data-tip data-for='temperatureInfo'/>
              <ReactTooltip id='temperatureInfo' className='info__tooltip' place='left' effect='solid' delayHide={150}>
                Equilibrium temperature estimate
              </ReactTooltip>
              <ReactTooltip id='tempUnit' className='info__tooltip' clickable place='left' effect='solid' globalEventOff='click'>
                <div className='info__toggle'>
                  <span className={`info__unit ${tempUnit === 'C' ? 'active' : ''}`} onClick={() => setTempUnit('C')}>°C</span>
                  <span className={`info__unit ${tempUnit === 'F' ? 'active' : ''}`} onClick={() => setTempUnit('F')}>°F</span>
                </div>
                <div>Choose your preferred unit</div>
              </ReactTooltip>
            </div>
          </div>   

          {/* Orbital Period | Stars */}
          <div className='info__facts-row'>
            <div className='info__fact'>
              <span className='info__fact-value'><strong>{planet.pl_orbper}</strong> Earth Days</span>
              <img src='/icons/orbit.png' alt='Orbital period' className='info__fact-icon' data-tip data-for='orbitalInfo'/>
              <ReactTooltip id='orbitalInfo' className='info__tooltip' place='left' effect='solid' delayHide={150}>
                Time the planet takes to make a complete orbit around the host star or system
              </ReactTooltip>
            </div>
            <div className='info__fact'>
              <span className='info__fact-value'><strong>{planet.sy_snum}</strong></span>
              <img src='/icons/star.png' alt='Stars in system' className='info__fact-icon' data-tip data-for='starsInfo'/>
              <ReactTooltip id='starsInfo' className='info__tooltip' place='left' effect='solid' delayHide={150}>
                Number of stars in the host system
              </ReactTooltip>
            </div>
          </div>

            {/* Distance */}
            <div className='info__facts-row info__facts-row--full'>
            <div className='info__fact'>
              <span className='info__fact-value'><strong>{planet.sy_dist}</strong> Light Years</span>
              <img src='/icons/distance.png' alt='Distance' className='info__fact-icon' data-tip data-for='distanceInfo'/>
              <ReactTooltip id='distanceInfo' className='info__tooltip' place='left' effect='solid' delayHide={150}>
                Approximate distance from Earth to the planetary system
              </ReactTooltip>
            </div>
          </div>
        </div>
      </Section>

      {planet.pl_refname && (
        <div className='info--ref'>{parse(planet.pl_refname)}</div>
      )}

      {/* Tooltips rendered at component level to avoid unmounting issues */}
      {planet.pl_type && (
        <ReactTooltip id='planetType' className='info__tooltip' place='left' effect='solid' delayHide={150}>
          {typeDesc[planet.pl_type as PlanetTypes]}
        </ReactTooltip>
      )}
    </div>
  );
}