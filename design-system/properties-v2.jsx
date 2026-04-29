// === Right rail: properties panel ===
function Properties({ design, setDesign }) {
  const bg = design.bg;

  const setBg = (patch) => setDesign(d => ({ ...d, bg: { ...d.bg, ...patch } }));
  const setGrad = (patch) => setDesign(d => ({ ...d, bg: { ...d.bg, gradient: { ...d.bg.gradient, ...patch } }}));

  return (
    <aside className="rail-r">
      <div className="props-head">
        <div className="title">The <em>Properties</em></div>
        <div className="sub">Background · Shape · Texture</div>
      </div>

      <div className="props-body">
        {/* Background type */}
        <div className="prop-section">
          <div className="prop-label">Background</div>
          <div className="bg-types">
            {BG_TYPES.slice(0, 4).map(t => (
              <BgTypeBtn key={t.id} t={t} active={bg.type===t.id} onClick={() => setBg({ type: t.id })} bg={bg} />
            ))}
            {BG_TYPES.slice(4).map(t => (
              <BgTypeBtn key={t.id} t={t} active={bg.type===t.id || (t.id==='noise' && bg.grain>0) || (t.id==='pattern' && bg.pattern!=='none')} onClick={() => {
                if (t.id === 'noise') setBg({ grain: bg.grain > 0 ? 0 : 0.4 });
                else if (t.id === 'pattern') setBg({ pattern: bg.pattern === 'none' ? 'dots' : 'none' });
                else setBg({ type: t.id });
              }} bg={bg} />
            ))}
          </div>

          {/* Conditional: solid color */}
          {bg.type === 'solid' && (
            <>
              <div className="color-row">
                <div className="swatch" style={{ background: bg.color }} />
                <input className="hex" value={bg.color.replace('#','')} onChange={e => setBg({ color: '#' + e.target.value.replace('#','') })} />
                <span className="opacity">100%</span>
              </div>
              <div style={{ height: 10 }} />
              <div className="prop-label" style={{ marginBottom: 6, marginTop: 4 }}>Swatches</div>
              <div className="swatch-row">
                {SWATCHES.map(c => (
                  <button key={c} className={`sw ${bg.color===c?'active':''}`} style={{ background: c }} onClick={() => setBg({ color: c })} />
                ))}
              </div>
            </>
          )}

          {/* Gradient palettes for linear / radial / conic / mesh */}
          {(bg.type === 'linear' || bg.type === 'radial' || bg.type === 'conic' || bg.type === 'mesh') && (
            <>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                {bg.type === 'linear' && (
                  <button
                    className="angle-pad"
                    onClick={() => setGrad({ angle: (bg.gradient.angle + 45) % 360 })}
                    title="Click to rotate angle"
                  >
                    <span className="arm" style={{ transform: `rotate(${bg.gradient.angle - 90}deg)` }} />
                  </button>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 4 }}>
                    {bg.type === 'linear' ? `Angle · ${bg.gradient.angle}°` : bg.type === 'mesh' ? 'Mesh blobs' : bg.type === 'conic' ? 'Conic spin' : 'Radial'}
                  </div>
                  <div className="gradient-bar" style={{
                    background: `linear-gradient(90deg, ${bg.gradient.colors.join(', ')})`
                  }}>
                    {bg.gradient.colors.map((c, i) => (
                      <div key={i} className="stop" style={{ left: `${(i / Math.max(1, bg.gradient.colors.length-1)) * 100}%`, background: c }} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="prop-label" style={{ marginBottom: 8 }}>Gradient palettes</div>
              <div className="palette-list">
                {GRADIENTS.map(g => {
                  const active = JSON.stringify(g.colors) === JSON.stringify(bg.gradient.colors);
                  return (
                    <button key={g.id} className={`palette-row ${active?'active':''}`} onClick={() => setGrad({ colors: g.colors, angle: g.angle })}>
                      <div className="strip">
                        {g.colors.map((c, i) => <span key={i} style={{ background: c }} />)}
                      </div>
                      <div className="pname">{g.name}</div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Foreground / icon color */}
        <div className="prop-section">
          <div className="prop-label">Icon color</div>
          <div className="color-row">
            <div className="swatch" style={{ background: design.foreground }} />
            <input className="hex" value={design.foreground.replace('#','')} onChange={e => setDesign(d => ({ ...d, foreground: '#' + e.target.value.replace('#','') }))} />
            <span className="opacity">100%</span>
          </div>
          <div style={{ height: 10 }} />
          <div className="swatch-row">
            {SWATCHES.map(c => (
              <button key={c} className={`sw ${design.foreground===c?'active':''}`} style={{ background: c }} onClick={() => setDesign(d => ({ ...d, foreground: c }))} />
            ))}
          </div>
          {design.content.mode === 'icon' && (
            <div className="toggle-row" style={{ marginTop: 12 }}>
              <span style={{ fontSize: 13 }}>Filled icon</span>
              <div className={`toggle ${design.content.filled?'on':''}`} onClick={() => setDesign(d => ({ ...d, content: { ...d.content, filled: !d.content.filled }}))} />
            </div>
          )}
        </div>

        {/* Shape */}
        <div className="prop-section">
          <div className="prop-label">
            <span>Corner radius</span>
            <span className="val">{design.radius}%</span>
          </div>
          <div className="slider-row">
            <input className="slider" type="range" min="0" max="50" value={design.radius} onChange={e => setDesign(d => ({ ...d, radius: +e.target.value }))} />
          </div>
          <div style={{ height: 14 }} />
          <div className="prop-label">
            <span>Content size</span>
            <span className="val">{design.contentSize}%</span>
          </div>
          <div className="slider-row">
            <input className="slider" type="range" min="20" max="90" value={design.contentSize} onChange={e => setDesign(d => ({ ...d, contentSize: +e.target.value }))} />
          </div>
        </div>

        {/* Pattern */}
        <div className="prop-section">
          <div className="prop-label">
            <span>Pattern overlay</span>
            <span className="val">{bg.pattern==='none' ? 'off' : bg.pattern}</span>
          </div>
          <div className="pattern-row">
            {PATTERNS.map(p => (
              <button
                key={p.id}
                className={`pattern-cell ${bg.pattern===p.id?'active':''}`}
                onClick={() => setBg({ pattern: p.id })}
                title={p.name}
                style={{
                  background: p.id === 'none' ? 'var(--surface-2)' : (bg.type === 'solid' ? bg.color : `linear-gradient(135deg, ${bg.gradient.colors.join(', ')})`),
                  position: 'relative',
                }}
              >
                {p.id === 'none' ? (
                  <span style={{ fontSize: 9, color: 'var(--ink-3)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>None</span>
                ) : (
                  <PatternOverlay pattern={p.id} color={design.foreground} opacity={0.5} />
                )}
              </button>
            ))}
          </div>
          {bg.pattern !== 'none' && (
            <>
              <div style={{ height: 12 }} />
              <div className="prop-label">
                <span>Pattern opacity</span>
                <span className="val">{Math.round(bg.patternOpacity * 100)}%</span>
              </div>
              <div className="slider-row">
                <input className="slider" type="range" min="0" max="100" value={Math.round(bg.patternOpacity * 100)} onChange={e => setBg({ patternOpacity: +e.target.value / 100 })} />
              </div>
            </>
          )}
        </div>

        {/* Grain */}
        <div className="prop-section">
          <div className="prop-label">
            <span>Grain</span>
            <span className="val">{Math.round(bg.grain * 100)}%</span>
          </div>
          <div className="slider-row">
            <input className="slider" type="range" min="0" max="80" value={Math.round(bg.grain * 100)} onChange={e => setBg({ grain: +e.target.value / 100 })} />
          </div>
        </div>
      </div>
    </aside>
  );
}

function BgTypeBtn({ t, active, onClick, bg }) {
  let swatchStyle = {};
  switch (t.id) {
    case 'solid':
      swatchStyle = { background: '#1A1A1F' }; break;
    case 'linear':
      swatchStyle = { background: 'linear-gradient(135deg, #FF6B35, #F7931E)' }; break;
    case 'radial':
      swatchStyle = { background: 'radial-gradient(circle at 30% 30%, #00DBDE, #4A00E0)' }; break;
    case 'conic':
      swatchStyle = { background: 'conic-gradient(from 0deg, #FF6B6B, #4FACFE, #84CC16, #FF6B6B)' }; break;
    case 'mesh':
      swatchStyle = {
        background: `radial-gradient(at 20% 20%, #FF80AB 0px, transparent 60%), radial-gradient(at 80% 30%, #80D8FF 0px, transparent 60%), radial-gradient(at 50% 90%, #FBBF24 0px, transparent 60%), #8B5CF6`
      };
      break;
    case 'pattern':
      swatchStyle = { background: '#1A1A1F', backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'><circle cx='2' cy='2' r='1' fill='white'/></svg>`)}")` };
      break;
    case 'noise':
      swatchStyle = { background: 'linear-gradient(135deg, #6366F1, #EC4899)' };
      break;
  }
  return (
    <button className={`bg-type-btn ${active?'active':''}`} onClick={onClick} title={t.label}>
      <div className="swatch" style={swatchStyle} />
      <div className="lbl">{t.label}</div>
    </button>
  );
}

Object.assign(window, { Properties });
