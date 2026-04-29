// === Center canvas: hero icon + previews (size grid / phone / browser) ===
function Canvas({ design, setDesign }) {
  const [surface, setSurface] = React.useState('sizes'); // sizes | phone | browser
  const [zoom, setZoom] = React.useState(100);

  const sizes = [
    { px: 512, label: '512' },
    { px: 192, label: '192' },
    { px: 128, label: '128' },
    { px: 96,  label: '96' },
    { px: 64,  label: '64' },
    { px: 32,  label: '32' },
    { px: 16,  label: '16' },
  ];

  return (
    <main className="canvas">
      <div className="canvas-toolbar">
        <div className="left">
          <div className="surface-tabs">
            <button className={`surface-tab ${surface==='sizes'?'active':''}`} onClick={() => setSurface('sizes')}>
              <UI.Sizes /> Size grid
            </button>
            <button className={`surface-tab ${surface==='phone'?'active':''}`} onClick={() => setSurface('phone')}>
              <UI.Phone /> Phone
            </button>
            <button className={`surface-tab ${surface==='browser'?'active':''}`} onClick={() => setSurface('browser')}>
              <UI.Browser /> Browser
            </button>
          </div>
        </div>
        <div className="right">
          <button className="icon-btn" title="Reset"><UI.Reset /></button>
          <div className="zoom-pill">
            <button onClick={() => setZoom(z => Math.max(50, z - 10))}><UI.Minus /></button>
            <div className="val">{zoom}%</div>
            <button onClick={() => setZoom(z => Math.min(200, z + 10))}><UI.Plus /></button>
          </div>
          <button className="icon-btn" title="Fullscreen"><UI.Maximize /></button>
        </div>
      </div>

      <div className="canvas-stage">
        <div className="canvas-headline">
          <div className="h1">
            The Studio<br/>for <em>Marks &amp; Icons</em>
          </div>
          <div className="meta">
            <strong>Issue №{new Date().getFullYear()}</strong>
            Spring Edition<br/>
            Composed in browser
          </div>
        </div>
        <div className="hero-icon-wrap">
          <div className="hero-icon" style={{ transform: `scale(${zoom/100})` }}>
            <AppIconHero design={design} />
          </div>
        </div>
        <div className="hero-meta">
          <span>{design.name}</span>
          <span className="sep" />
          <span>{design.content.mode === 'letters' ? `${design.content.font}` : design.content.iconName || 'Custom'}</span>
          <span className="sep" />
          <span>{design.bg.type.toUpperCase()}</span>
        </div>

        {surface === 'sizes' && <SizeGrid design={design} sizes={sizes} />}
        {surface === 'phone' && <PhonePreview design={design} />}
        {surface === 'browser' && <BrowserPreview design={design} />}
      </div>
    </main>
  );
}

function AppIconHero({ design }) {
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', overflow: 'hidden', background: renderBackground(design.bg) }}>
        <PatternOverlay pattern={design.bg.pattern} color={design.bg.patternColor} opacity={design.bg.patternOpacity} />
        <GrainOverlay amount={design.bg.grain} />
      </div>
      {design.content.mode === 'icon' ? (
        <div className="content" style={{ width: `${design.contentSize}%`, height: `${design.contentSize}%` }}>
          <svg viewBox="0 0 24 24" fill="none" stroke={design.foreground} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d={design.content.iconPath} fill={design.content.filled ? design.foreground : 'none'} />
          </svg>
        </div>
      ) : (
        <div className="letter-content" style={{
          color: design.foreground,
          fontFamily: `'${design.content.font}', sans-serif`,
          fontWeight: design.content.fontWeight,
          fontSize: `${320 * (design.contentSize / 100) * 0.6}px`,
          letterSpacing: '-0.03em',
          zIndex: 2,
          position: 'relative',
        }}>
          {design.content.letters}
        </div>
      )}
    </>
  );
}

function SizeGrid({ design, sizes }) {
  return (
    <div className="preview-rows">
      <div className="preview-row">
        <div className="row-head">
          <div className="row-title">
            Size variations
            <span className="badge">7 sizes</span>
          </div>
          <button className="row-action">Edit set</button>
        </div>
        <div className="size-row">
          {sizes.map(s => (
            <div className="size-cell" key={s.px}>
              <div className="mini-icon" style={{
                width: Math.min(s.px, 96),
                height: Math.min(s.px, 96),
                borderRadius: `${design.radius}%`,
                background: renderBackground(design.bg),
              }}>
                <PatternOverlay pattern={design.bg.pattern} color={design.bg.patternColor} opacity={design.bg.patternOpacity} />
                <GrainOverlay amount={design.bg.grain} />
                <MiniContent design={design} />
              </div>
              <div className="label">{s.px}×{s.px}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniContent({ design }) {
  if (design.content.mode === 'icon') {
    return (
      <div className="content">
        <svg viewBox="0 0 24 24" fill="none" stroke={design.foreground} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d={design.content.iconPath} fill={design.content.filled ? design.foreground : 'none'} />
        </svg>
      </div>
    );
  }
  return (
    <div style={{
      position: 'relative', zIndex: 2,
      color: design.foreground,
      fontFamily: `'${design.content.font}', sans-serif`,
      fontWeight: design.content.fontWeight,
      fontSize: '60%',
      letterSpacing: '-0.03em',
      lineHeight: 1,
    }}>
      {design.content.letters}
    </div>
  );
}

function PhonePreview({ design }) {
  const apps = ['Mail', 'Maps', 'Music', 'Chat', 'Camera', 'Notes', 'Health', 'Photos', 'Wallet', 'Books', 'Files', 'Stocks'];
  return (
    <div className="preview-rows">
      <div className="preview-row">
        <div className="row-head">
          <div className="row-title">
            On a phone home screen
            <span className="badge">iOS</span>
          </div>
          <button className="row-action">Change wallpaper</button>
        </div>
        <div className="phone-frame">
          <div className="phone-screen">
            <div className="phone-status">
              <span>9:41</span>
              <div className="dots"><span>●●●</span> <span>📶</span></div>
            </div>
            <div className="phone-grid">
              <div className="phone-app">
                <div className="app-ico real" style={{ borderRadius: `${design.radius * 0.45}%`, background: renderBackground(design.bg) }}>
                  <PatternOverlay pattern={design.bg.pattern} color={design.bg.patternColor} opacity={design.bg.patternOpacity} />
                  <GrainOverlay amount={design.bg.grain} />
                  <PhoneAppContent design={design} />
                </div>
                <div className="label">{design.name}</div>
              </div>
              {apps.slice(0,11).map(a => (
                <div className="phone-app" key={a}>
                  <div className="app-ico" />
                  <div className="label">{a}</div>
                </div>
              ))}
            </div>
            <div className="phone-dock">
              <div className="app-ico" style={{ background: 'rgba(255,255,255,0.25)' }} />
              <div className="app-ico" style={{ background: 'rgba(255,255,255,0.25)' }} />
              <div className="app-ico" style={{ background: 'rgba(255,255,255,0.25)' }} />
              <div className="app-ico real" style={{ borderRadius: `${design.radius * 0.45}%`, background: renderBackground(design.bg) }}>
                <PhoneAppContent design={design} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhoneAppContent({ design }) {
  if (design.content.mode === 'icon') {
    return (
      <div style={{ width: '60%', height: '60%', display: 'grid', placeItems: 'center', position: 'relative', zIndex: 2 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke={design.foreground} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
          <path d={design.content.iconPath} fill={design.content.filled ? design.foreground : 'none'} />
        </svg>
      </div>
    );
  }
  return (
    <div style={{
      color: design.foreground,
      fontFamily: `'${design.content.font}', sans-serif`,
      fontWeight: design.content.fontWeight,
      fontSize: '20px',
      letterSpacing: '-0.03em',
      lineHeight: 1,
      position: 'relative', zIndex: 2,
    }}>
      {design.content.letters}
    </div>
  );
}

function BrowserPreview({ design }) {
  return (
    <div className="preview-rows">
      <div className="preview-row">
        <div className="row-head">
          <div className="row-title">
            In the browser tab
            <span className="badge">Favicon</span>
          </div>
          <button className="row-action">Test in dark mode</button>
        </div>
        <div className="browser-frame">
          <div className="browser-bar">
            <div className="lights"><span /><span /><span /></div>
            <div className="browser-tabs">
              <div className="browser-tab">
                <div className="tab-ico" style={{ borderRadius: `${design.radius * 0.18}px`, background: renderBackground(design.bg) }}>
                  <PatternOverlay pattern={design.bg.pattern} color={design.bg.patternColor} opacity={design.bg.patternOpacity} />
                  <div className="content">
                    {design.content.mode === 'icon' ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke={design.foreground} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d={design.content.iconPath} fill={design.content.filled ? design.foreground : 'none'} />
                      </svg>
                    ) : (
                      <span style={{
                        color: design.foreground,
                        fontFamily: `'${design.content.font}', sans-serif`,
                        fontWeight: design.content.fontWeight,
                        fontSize: '8px',
                        lineHeight: 1,
                      }}>{design.content.letters}</span>
                    )}
                  </div>
                </div>
                <span>{design.name}</span>
              </div>
              <div className="browser-tab inactive">
                <div className="tab-ico" style={{ background: '#FF6B6B' }} />
                <span>Mail · Inbox</span>
              </div>
              <div className="browser-tab inactive">
                <div className="tab-ico" style={{ background: '#4FACFE' }} />
                <span>Calendar</span>
              </div>
            </div>
          </div>
          <div className="browser-body" />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Canvas });
