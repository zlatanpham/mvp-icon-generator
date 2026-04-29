// === Left sidebar: Library / Letters / Upload tabs ===
function Sidebar({ design, setDesign }) {
  const [tab, setTab] = React.useState(design.content.mode === 'letters' ? 'letters' : 'icons');
  const [iconSearch, setIconSearch] = React.useState('');
  const [fontCat, setFontCat] = React.useState('All');
  const [fontSearch, setFontSearch] = React.useState('');

  const filteredIcons = ICONS.filter(i => i.name.toLowerCase().includes(iconSearch.toLowerCase()));
  const filteredFonts = FONTS.filter(f =>
    (fontCat === 'All' || f.cat === fontCat) &&
    f.name.toLowerCase().includes(fontSearch.toLowerCase())
  );

  const setMode = (mode) => {
    setTab(mode === 'icons' ? 'icons' : mode === 'letters' ? 'letters' : 'upload');
    if (mode === 'letters') {
      setDesign(d => ({ ...d, content: { ...d.content, mode: 'letters' } }));
    } else if (mode === 'icons') {
      setDesign(d => ({ ...d, content: { ...d.content, mode: 'icon' } }));
    }
  };

  return (
    <aside className="rail-l">
      <div className="rail-tabs">
        <button className={`rail-tab ${tab==='icons'?'active':''}`} onClick={() => setMode('icons')}>
          <UI.Library />
          <span>Library</span>
        </button>
        <button className={`rail-tab ${tab==='letters'?'active':''}`} onClick={() => setMode('letters')}>
          <UI.Type />
          <span>Letters</span>
        </button>
        <button className={`rail-tab ${tab==='upload'?'active':''}`} onClick={() => setMode('upload')}>
          <UI.Upload />
          <span>Upload</span>
        </button>
      </div>

      {tab === 'icons' && (
        <>
          <div className="rail-section">
            <div className="search">
              <UI.Search />
              <input placeholder="Search 30 icons" value={iconSearch} onChange={e => setIconSearch(e.target.value)} />
            </div>
          </div>
          <div className="sec-title">
            <span>Library</span>
            <button>Browse all</button>
          </div>
          <div className="icon-grid">
            {filteredIcons.map(ico => (
              <button
                key={ico.id}
                className={`icon-cell ${design.content.iconId === ico.id && design.content.mode === 'icon' ? 'active' : ''}`}
                title={ico.name}
                onClick={() => setDesign(d => ({
                  ...d,
                  content: { ...d.content, mode: 'icon', iconId: ico.id, iconPath: ico.svg, iconName: ico.name },
                }))}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d={ico.svg} />
                </svg>
              </button>
            ))}
          </div>
        </>
      )}

      {tab === 'letters' && (
        <>
          <div className="letters-input">
            <label>Your letters</label>
            <input
              className="big-input"
              maxLength={3}
              value={design.content.letters}
              onChange={e => setDesign(d => ({ ...d, content: { ...d.content, letters: e.target.value.toUpperCase(), mode: 'letters' } }))}
              placeholder="A"
            />
            <div className="helper">1 – 3 characters work best</div>
          </div>

          <div className="font-search">
            <UI.Search />
            <input placeholder="Search Google Fonts" value={fontSearch} onChange={e => setFontSearch(e.target.value)} />
          </div>

          <div className="font-cats">
            {FONT_CATS.map(c => (
              <button key={c} className={`chip ${fontCat===c?'active':''}`} onClick={() => setFontCat(c)}>{c}</button>
            ))}
          </div>

          <div className="font-list">
            {filteredFonts.map(f => (
              <button
                key={f.name}
                className={`font-card ${design.content.font === f.name ? 'active' : ''}`}
                onClick={() => setDesign(d => ({
                  ...d,
                  content: { ...d.content, mode: 'letters', font: f.name, fontWeight: f.weight }
                }))}
              >
                <div className="preview" style={{ fontFamily: `'${f.name}', sans-serif`, fontWeight: f.weight }}>
                  {(design.content.letters || 'Aa').slice(0, 2)}
                </div>
                <div className="meta">
                  <div className="name">{f.name}</div>
                  <div className="cat">{f.cat}</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {tab === 'upload' && (
        <>
          <div className="upload-zone">
            <div className="ico"><UI.Upload /></div>
            <div className="title">Drop a file or browse</div>
            <div className="sub">Use your own logo or icon</div>
            <div className="formats">SVG · PNG · JPG · 5 MB max</div>
          </div>
          <div className="sec-title">
            <span>Recent uploads</span>
          </div>
          <div className="recent-list">
            {[0,1,2,3,4,5,6,7].map(i => (
              <div key={i} className="cell">
                <UI.Image />
              </div>
            ))}
          </div>
        </>
      )}
    </aside>
  );
}

Object.assign(window, { Sidebar });
