import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { RotateCcw, Ruler, Check, PenLine } from 'lucide-react';
import type { Product } from '../data/products';
import { findColor } from '../data/products';
import { phrases } from '../brand';
import { formatPrice } from '../lib/format';
import { useCart } from '../context/CartContext';
import GarmentPreview from './GarmentPreview';
import type { LogoSide } from './GarmentPreview';
import SizeGuide from './SizeGuide';
import StickyBuy from './StickyBuy';

type Props = { product: Product; initialColor?: string; showNote?: boolean; photos?: string[]; header?: ReactNode };

export default function Configurator({ product, initialColor, showNote = false, photos = [], header }: Props) {
  const garment = product.garment!;
  const [color, setColor] = useState(findColor(product, initialColor)!.name);
  const [side, setSide] = useState<LogoSide>('centre');
  const [phrase, setPhrase] = useState<string>(phrases[3]);
  const [custom, setCustom] = useState(false);
  const [ownText, setOwnText] = useState('');
  const customRef = useRef<HTMLInputElement>(null);
  const [placement, setPlacement] = useState<'front' | 'back'>('front');
  const [size, setSize] = useState<string>();
  const [note, setNote] = useState('');
  const [view, setView] = useState<'front' | 'back'>('front');
  const [photo, setPhoto] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [guide, setGuide] = useState(false);
  const [added, setAdded] = useState(false);
  const buyRef = useRef<HTMLButtonElement>(null);
  const sizeRef = useRef<HTMLFieldSetElement>(null);
  const { addItem } = useCart();
  const swatch = findColor(product, color)!;

  useEffect(() => { if (initialColor) setColor(findColor(product, initialColor)!.name); }, [initialColor, product]);
  useEffect(() => { if (!added) return; const t = window.setTimeout(() => setAdded(false), 2600); return () => window.clearTimeout(t); }, [added]);

  function choosePlacement(p: 'front' | 'back') { setPlacement(p); setView(p); setPhoto(null); }
  function add() {
    if (!size) { setSizeError(true); sizeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    const text = phrase.trim();
    if (custom && !text) { customRef.current?.focus(); return; }
    addItem(product, { color, size, side, phrase: text || undefined, placement: text ? placement : undefined, note: note.trim() || undefined });
    setAdded(true);
  }

  return <div className="config">
    <div className="config-stage">
      <div className="stage-frame">
        <AnimatePresence mode="wait">
          {photo
            ? <motion.img key={photo} className="stage-photo" src={photo} alt={`${product.name} photo`} initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} />
            : <motion.div key="live" className={`flipper ${view === 'back' ? 'is-back' : ''}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="face"><GarmentPreview garment={garment} color={swatch} side={side} phrase={phrase || undefined} placement={placement} view="front" glow /></div>
                <div className="face face-back"><GarmentPreview garment={garment} color={swatch} side={side} phrase={phrase || undefined} placement={placement} view="back" glow /></div>
              </motion.div>}
        </AnimatePresence>
        <span className="stage-tag">Live preview · {swatch.name}</span>
        {!photo && <button className="stage-flip" onClick={() => setView(view === 'front' ? 'back' : 'front')} aria-label={`Show ${view === 'front' ? 'back' : 'front'}`}><RotateCcw size={15} strokeWidth={1.5} /> {view === 'front' ? 'See back' : 'See front'}</button>}
      </div>
      <div className="stage-thumbs">
        <button className={!photo && view === 'front' ? 'is-active' : ''} onClick={() => { setPhoto(null); setView('front'); }} aria-label="Front preview"><GarmentPreview garment={garment} color={swatch} side={side} phrase={phrase || undefined} placement={placement} /></button>
        <button className={!photo && view === 'back' ? 'is-active' : ''} onClick={() => { setPhoto(null); setView('back'); }} aria-label="Back preview"><GarmentPreview garment={garment} color={swatch} side={side} phrase={phrase || undefined} placement={placement} view="back" /></button>
        {photos.map(src => <button key={src} className={photo === src ? 'is-active' : ''} onClick={() => setPhoto(src)} aria-label="Product photo"><img src={src} alt="" /></button>)}
      </div>
    </div>

    <div className="config-panel">
      {header}
      <fieldset className="opt">
        <legend>Colour <em>{swatch.name}</em></legend>
        <div className="swatches">{product.colors!.map(c => <button key={c.name} type="button" className={`swatch ${c.name === color ? 'is-active' : ''}`} style={{ ['--sw' as string]: c.hex }} aria-pressed={c.name === color} aria-label={c.name} onClick={() => { setColor(c.name); setPhoto(null); }}>{c.name === color && <Check size={14} color={c.dark ? '#F3EEE4' : '#151313'} />}</button>)}</div>
      </fieldset>

      <fieldset className="opt">
        <legend>Logo position <em>{side === 'centre' ? 'Centre' : `Top ${side}`}</em></legend>
        <div className="segmented">{(['left', 'centre', 'right'] as const).map(s => <button key={s} type="button" className={side === s ? 'is-active' : ''} aria-pressed={side === s} onClick={() => { setSide(s); setView('front'); setPhoto(null); }}>{s === 'centre' ? 'Centre' : `Top ${s}`}</button>)}</div>
        <p className="opt-hint">{side === 'centre' ? 'Classic layout: Artios mark on the chest, lantern and ALÁTÙPÀ on the back.' : 'Corner layout: lantern, ALÁTÙPÀ and the Artios mark together on the chest.'}</p>
      </fieldset>

      <fieldset className="opt">
        <legend>Your words <em>{custom ? 'Your own' : phrase ? 'Catch phrase' : 'None'}</em></legend>
        <div className="phrase-list">
          {phrases.map(p => <button key={p} type="button" className={`phrase ${!custom && phrase === p ? 'is-active' : ''}`} aria-pressed={!custom && phrase === p} onClick={() => { setCustom(false); setPhrase(p); setView(placement); setPhoto(null); }}><span className="phrase-dot" />{p}</button>)}
          <div className={`phrase phrase-own ${custom ? 'is-active' : ''}`}>
            <button type="button" aria-pressed={custom} onClick={() => { setCustom(true); setPhrase(ownText); setView(placement); setPhoto(null); window.setTimeout(() => customRef.current?.focus(), 30); }}><span className="phrase-dot" /><PenLine size={15} strokeWidth={1.4} /> Write your own</button>
            {custom && <label className="own-field">
              <span className="sr-only">Your own words</span>
              <input ref={customRef} value={ownText} maxLength={40} placeholder="Type the words you want printed" autoComplete="off"
                onChange={e => { setOwnText(e.target.value); setPhrase(e.target.value); setPhoto(null); }} />
              <span className="own-count" aria-live="polite">{ownText.length}/40</span>
            </label>}
          </div>
          <button type="button" className={`phrase phrase-none ${!custom && phrase === '' ? 'is-active' : ''}`} aria-pressed={!custom && phrase === ''} onClick={() => { setCustom(false); setPhrase(''); setView('front'); }}><span className="phrase-dot" />No phrase, logo only</button>
        </div>
      </fieldset>

      {(phrase || custom) && <fieldset className="opt">
        <legend>Phrase placement</legend>
        <div className="segmented">
          <button type="button" className={placement === 'front' ? 'is-active' : ''} aria-pressed={placement === 'front'} onClick={() => choosePlacement('front')}>Under the logo</button>
          <button type="button" className={placement === 'back' ? 'is-active' : ''} aria-pressed={placement === 'back'} onClick={() => choosePlacement('back')}>Large on the back</button>
        </div>
      </fieldset>}

      <fieldset className={`opt ${sizeError ? 'has-error' : ''}`} ref={sizeRef}>
        <legend>Size {size && <em>{size}</em>}<button type="button" className="guide-link" onClick={() => setGuide(true)}><Ruler size={14} strokeWidth={1.5} /> Size guide</button></legend>
        <div className="sizes">{product.sizes!.map(s => <button key={s} type="button" className={size === s ? 'is-active' : ''} aria-pressed={size === s} onClick={() => { setSize(s); setSizeError(false); }}>{s}</button>)}</div>
        {sizeError && <p className="opt-error" role="alert">Please choose a size.</p>}
      </fieldset>

      {showNote && <label className="opt note-field">
        <span>Anything else? <em>Optional</em></span>
        <textarea value={note} maxLength={220} rows={3} onChange={e => setNote(e.target.value)} placeholder="E.g. a name on the sleeve, a different print colour, a gift message…" />
      </label>}

      <div className="buy-row">
        <div className="buy-price"><span>{product.name}</span><strong>{formatPrice(product.price)}</strong></div>
        <button ref={buyRef} className="solid-button buy-button" onClick={add}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={added ? 'a' : 'b'} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={{ duration: 0.25 }}>{added ? 'Added to your bag ✓' : 'Add to bag'}</motion.span>
          </AnimatePresence>
        </button>
        <p className="buy-note">Made to order and delivered across Nigeria. Order and pay on WhatsApp.{!showNote && <> Want more changes? <Link to={`/studio?item=${garment}`}>Open the design studio</Link>.</>}</p>
      </div>
    </div>
    <SizeGuide open={guide} onClose={() => setGuide(false)} garment={garment} />
    <StickyBuy target={buyRef} name={`${product.name} · ${swatch.name}`} price={product.price} label="Add to bag" onClick={add} />
  </div>;
}
