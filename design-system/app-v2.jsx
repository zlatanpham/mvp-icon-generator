// === App entry (v2 — Atelier) ===
const { useState } = React;

const INITIAL_DESIGN = {
  name: 'Atlas',
  bg: {
    type: 'solid',
    color: '#15140F',
    gradient: { colors: ['#B0413E', '#8E2C29'], angle: 135 },
    pattern: 'none',
    patternColor: '#F7F3E9',
    patternOpacity: 0.18,
    grain: 0.18,
  },
  foreground: '#F7F3E9',
  radius: 22,
  contentSize: 55,
  content: {
    mode: 'icon',
    iconId: 'spark',
    iconName: 'Spark',
    iconPath: 'M12 2L14 9.5L21.5 11L14.5 13L12 21L10 13L2.5 11L10.5 9.5Z',
    filled: true,
    letters: 'A',
    font: 'Fraunces',
    fontWeight: 900,
  },
};

function Topbar({ design, setDesign }) {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark">Atelier</div>
        <div className="brand-tag">No. 02 · Vol. I</div>
      </div>
      <div className="crumbs">
        <span>Workspace</span>
        <span className="sep">—</span>
        <span className="file">
          <input
            className="file-name"
            value={design.name}
            onChange={e => setDesign(d => ({ ...d, name: e.target.value }))}
          />
        </span>
      </div>
      <div className="tb-actions" style={{ marginLeft: 18 }}>
        <button className="btn btn-accent"><UI.Download /> Export</button>
      </div>
    </header>
  );
}

function App() {
  const [design, setDesign] = useState(INITIAL_DESIGN);
  return (
    <div className="app">
      <Topbar design={design} setDesign={setDesign} />
      <div className="body">
        <Sidebar design={design} setDesign={setDesign} />
        <Canvas design={design} setDesign={setDesign} />
        <Properties design={design} setDesign={setDesign} />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
