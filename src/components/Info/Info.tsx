import React from 'react';
import './Info.scss';
import { Exoplanet } from "../../models/exoplanet.model";
import parse from 'html-react-parser';
import ReactTooltip from "react-tooltip";
import { usePersistentState } from '../../hooks/usePersistentState';

const getWikipediaUrl = (planetName: string): string => {
  const cleanName = planetName.replace(/[^\w\s-]/g, '').trim();
  const encodedName = encodeURIComponent(cleanName);
  return `https://en.wikipedia.org/wiki/${encodedName}`;
};



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

  const hasWikipediaArticle = !!(planet.pl_desc || planet.pl_subtitle);

  return (
    <div className='info'>
      <div 
        className={`info--name ${hasWikipediaArticle ? 'info--name-clickable' : ''}`}
        onClick={hasWikipediaArticle ? () => window.open(getWikipediaUrl(planet.pl_name), '_blank') : undefined}
        title={hasWikipediaArticle ? "Click to view on Wikipedia" : undefined}
      >
        {planet.pl_name}
      </div>
      {planet.pl_subtitle && !planet.pl_desc && (<div className='info--subtitle'>{planet.pl_subtitle}</div>)}

      {planet.pl_desc && (
        <Section id="description" label={<span className='info--subtitle'>{planet.pl_subtitle || "Description"}</span>} defaultOpen={true}>
          <div className='info__text'>{planet.pl_desc}</div>
        </Section>
      )}

      {/* Facts */}
      <Section 
        id="facts" 
        label={<span className='info--subtitle'>Facts</span>}
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

    </div>
  );
}