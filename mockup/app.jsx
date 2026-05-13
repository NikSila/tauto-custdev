// app.jsx — host with two phone variants side-by-side + Tweaks

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "leftVariant": "ambient",
  "rightVariant": "hero",
  "showVoice": true,
  "accentHue": 85,
  "personality": "concierge"
}/*EDITMODE-END*/;

function PhoneCol({ label, sub, variant }) {
  const [screen, setScreen] = React.useState("car");
  const [taskKey, setTaskKey] = React.useState(null);

  function goto(s) { setScreen(s); }
  function onTaskOpen(k) { setTaskKey(k); setScreen("agent"); }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <IOSDevice width={402} height={874} dark>
        <div style={{ position: "absolute", inset: 0 }}>
          {screen === "car" && <CarScreen goto={goto} variant={variant} />}
          {screen === "chat" && <ChatScreen goto={goto} onTaskOpen={onTaskOpen} />}
          {screen === "agent" && <AgentScreen goto={goto} taskKey={taskKey} />}
          {screen === "voice" && <VoiceScreen goto={goto} />}
        </div>
      </IOSDevice>
      <div className="stage-label">{label}</div>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 4, fontStyle: "italic" }}>{sub}</div>

      {/* mini nav under each phone */}
      <div style={{ marginTop: 14, display: "flex", gap: 6 }}>
        {[
          ["car", "Авто"],
          ["chat", "Чат"],
          ["agent", "Задача"],
          ["voice", "Голос"],
        ].map(([k, l]) => (
          <button key={k} onClick={() => setScreen(k)} style={{
            padding: "5px 10px", fontSize: 11, borderRadius: 99, cursor: "pointer",
            background: screen === k ? "rgba(212,175,109,0.12)" : "transparent",
            color: screen === k ? "#D4AF6D" : "rgba(255,255,255,0.5)",
            border: `1px solid ${screen === k ? "rgba(212,175,109,0.3)" : "rgba(255,255,255,0.08)"}`,
            fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.06em",
          }}>{l}</button>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  return (
    <React.Fragment>
      <PhoneCol
        label="Variant A"
        sub="Ambient — quiet observation"
        variant={tweaks.leftVariant}
      />
      <PhoneCol
        label="Variant B"
        sub="Hero — statement card"
        variant={tweaks.rightVariant}
      />

      {/* Tweaks */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Variant A — entry point">
          <TweakRadio
            value={tweaks.leftVariant}
            onChange={v => setTweak("leftVariant", v)}
            options={[
              { value: "ambient", label: "Ambient" },
              { value: "hero", label: "Hero" },
            ]}
          />
        </TweakSection>
        <TweakSection label="Variant B — entry point">
          <TweakRadio
            value={tweaks.rightVariant}
            onChange={v => setTweak("rightVariant", v)}
            options={[
              { value: "ambient", label: "Ambient" },
              { value: "hero", label: "Hero" },
            ]}
          />
        </TweakSection>
        <TweakSection label="Personality">
          <TweakSelect
            value={tweaks.personality}
            onChange={v => setTweak("personality", v)}
            options={[
              { value: "concierge", label: "Formal concierge" },
              { value: "buddy", label: "Friendly buddy" },
              { value: "minimal", label: "Minimal — just facts" },
              { value: "enthusiast", label: "Car enthusiast" },
            ]}
          />
          <div style={{ marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>
            Affects copy tone in chat replies. Demo only.
          </div>
        </TweakSection>
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
