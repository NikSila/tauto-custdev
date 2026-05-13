// screens.jsx — All screens for the Concierge prototype

// ──────────────────────────────────────────────────────────────
// SCREEN 1 — Car detail (Concierge-style, AI integrated)
// ──────────────────────────────────────────────────────────────
function CarScreen({ goto, variant = "ambient" }) {
  // variant: "ambient" — subtle floating spark in events row
  //          "hero"    — full Concierge hero card replaces fines/events
  return (
    <div className="phone-scroll" style={{
      position: "absolute", inset: 0, overflowY: "auto", overflowX: "hidden",
      paddingTop: 56, paddingBottom: 50, background: "#0a0a0a",
    }}>
      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 18px 0",
      }}>
        <button onClick={() => {}} style={{
          background: "none", border: "none", color: "#fff", fontSize: 17, fontWeight: 400,
          padding: 0, cursor: "pointer",
        }}>Закрыть</button>
        <div style={{ textAlign: "center", flex: 1, marginLeft: -52 }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Kia Sportage</div>
          <div style={{ fontSize: 12, color: TEXT_DIM, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.05em", marginTop: 1 }}>Н 652 УТ 196</div>
        </div>
      </div>

      {/* Hero car */}
      <div style={{
        position: "relative", margin: "26px 18px 16px",
        height: 178, borderRadius: 22, overflow: "hidden",
        background: "radial-gradient(ellipse at 50% 60%, #1a1a1a, #0a0a0a 70%)",
        border: `1px solid ${HAIRLINE}`,
      }}>
        {/* Concierge tag, top-left */}
        <div style={{ position: "absolute", top: 12, left: 14, display: "flex", alignItems: "center", gap: 6 }}>
          <Spark size={10} animate />
          <Mono size={8} color={GOLD}>Concierge</Mono>
        </div>
        <div style={{ position: "absolute", top: 12, right: 14 }}>
          <Mono size={8} color={TEXT_DIM}>2024 · 14 320 км</Mono>
        </div>
        {/* car */}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CarSilhouette width={320} height={140} />
        </div>
        {/* dot indicator */}
        <div style={{ position: "absolute", bottom: 10, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 5 }}>
          <span style={{ width: 5, height: 5, borderRadius: 99, background: GOLD }} />
          <span style={{ width: 5, height: 5, borderRadius: 99, background: "rgba(255,255,255,0.18)" }} />
        </div>
      </div>

      {/* AI ambient strip — replaces "Есть события" */}
      {variant === "ambient" ? (
        <AmbientStrip onTap={() => goto("chat")} />
      ) : (
        <ConciergeHero onTap={() => goto("chat")} />
      )}

      {/* Service icons row (kept) */}
      <ServiceRow />

      {/* Proactive AI cards */}
      <div style={{ padding: "0 18px", marginTop: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <Mono size={10} color={TEXT_DIM}>Предложения консьержа</Mono>
          <Mono size={9} color={GOLD_DIM}>3</Mono>
        </div>
        <ProactiveCard
          tag="Сервис"
          title="Скоро ТО — 80 000 км"
          body="Через 412 км. Я нашёл 3 сервиса с гарантией Kia на этой неделе, от 14 200 ₽."
          cta="Показать"
          onClick={() => goto("agent")}
          accent
        />
        <div style={{ height: 10 }} />
        <ProactiveCard
          tag="Аварийка"
          title="ГИБДД — штраф 500 ₽"
          body="Превышение, ул. Малышева, 03 мая. Скидка 50% действует ещё 11 дней."
          cta="Оплатить"
          onClick={() => goto("chat")}
        />
        <div style={{ height: 10 }} />
        <ProactiveCard
          tag="Топливо"
          title="АЗС за 2,4 км дешевле на 4,80 ₽/л"
          body="ЛУКОЙЛ на Челюскинцев, 92‑й — 53,90 ₽. По маршруту домой."
          cta="Маршрут"
          onClick={() => goto("chat")}
        />
      </div>

      {/* Price card */}
      <div style={{ padding: "16px 18px 24px" }}>
        <Card padding={18}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <Mono color={TEXT_DIM}>Стоимость · сегодня</Mono>
              <div style={{ marginTop: 8 }}>
                <Serif size={32} weight={400}>2 778 599 ₽</Serif>
              </div>
              <div style={{ marginTop: 4, fontSize: 13, color: TEXT_MUTED }}>
                Kia Sportage IV · 2024
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{
                display: "inline-block", padding: "4px 10px", borderRadius: 99,
                fontSize: 10, color: GOLD, border: `1px solid ${HAIRLINE_GOLD}`,
                fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase",
              }}>+1.4%</span>
              <div style={{ marginTop: 8 }}>
                <Sparkline data={[40,42,41,44,46,45,48,47,50,52,51,54]} w={84} h={24} />
              </div>
            </div>
          </div>
          <Hairline style={{ margin: "16px 0" }}/>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Mono color={TEXT_DIM}>Держится 3 недели</Mono>
            <Mono color={GOLD_DIM}>Продать →</Mono>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─────────────── Ambient strip — subtle "I noticed 3 things" ───────────────
function AmbientStrip({ onTap }) {
  return (
    <div onClick={onTap} style={{
      margin: "0 18px 16px", padding: "14px 16px",
      background: "linear-gradient(180deg, rgba(212,175,109,0.07), rgba(212,175,109,0.02))",
      border: `1px solid ${HAIRLINE_GOLD}`,
      borderRadius: 16, display: "flex", alignItems: "center", gap: 12,
      cursor: "pointer", position: "relative", overflow: "hidden",
    }}>
      {/* shimmer band */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(90deg, transparent 0%, rgba(212,175,109,0.08) 50%, transparent 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmer-gold 6s ease-in-out infinite",
        pointerEvents: "none",
      }}/>
      <div style={{
        width: 36, height: 36, borderRadius: 99,
        background: "radial-gradient(circle at 30% 30%, #2a2014, #0a0a0a)",
        border: `1px solid ${HAIRLINE_GOLD}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Spark size={14} animate />
      </div>
      <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
        <Mono size={9} color={GOLD_DIM}>Концьерж · сейчас</Mono>
        <div style={{ marginTop: 3, fontSize: 14, color: "#fff", lineHeight: 1.3 }}>
          Я заметил <span style={{ color: GOLD }}>3 события</span> по машине. Открыть?
        </div>
      </div>
      <div style={{ flexShrink: 0, position: "relative" }}>{Glyph.arrowRight(14, GOLD)}</div>
    </div>
  );
}

// ─────────────── Hero variant — bigger Concierge card ───────────────
function ConciergeHero({ onTap }) {
  return (
    <div onClick={onTap} style={{
      margin: "0 18px 16px", padding: 18,
      background: "linear-gradient(180deg, #1a1408 0%, #0d0a05 100%)",
      border: `1px solid ${HAIRLINE_GOLD}`,
      borderRadius: 20, position: "relative", overflow: "hidden", cursor: "pointer",
    }}>
      <div style={{
        position: "absolute", top: -40, right: -30, width: 160, height: 160,
        background: "radial-gradient(circle, rgba(212,175,109,0.18), transparent 60%)",
        pointerEvents: "none",
      }}/>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Spark size={12} animate />
        <Mono size={9} color={GOLD}>Concierge · Активен</Mono>
      </div>
      <div style={{ marginTop: 10, position: "relative" }}>
        <Serif size={22} weight={400}>3 дела ждут вашего решения</Serif>
      </div>
      <div style={{ marginTop: 6, fontSize: 13, color: TEXT_MUTED, lineHeight: 1.4 }}>
        Штраф со скидкой, дешёвая АЗС по пути и запись на ТО до конца недели.
      </div>
      <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
        <GoldButton small>Открыть</GoldButton>
        <button onClick={(e)=>{e.stopPropagation();}} style={{
          height: 36, padding: "0 14px", borderRadius: 99, background: "transparent",
          color: TEXT_MUTED, border: `1px solid ${HAIRLINE}`, fontSize: 13, cursor: "pointer",
        }}>Позже</button>
      </div>
    </div>
  );
}

// ─────────────── Service icons row ───────────────
function ServiceRow() {
  const tiles = [
    { id: "fuel", label: "Топливо", glyph: Glyph.fuel, badge: "10%" },
    { id: "trans", label: "Транспондер", glyph: Glyph.transponder },
    { id: "service", label: "Сервис", glyph: Glyph.wrench, badge: "5%" },
    { id: "alert", label: "Аварийка", glyph: Glyph.alert },
    { id: "ins", label: "Страховка", glyph: Glyph.shield },
    { id: "fines", label: "Штрафы", glyph: Glyph.receipt, dot: true },
  ];
  return (
    <div style={{ padding: "0 18px" }}>
      <div className="phone-scroll" style={{
        display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6,
      }}>
        {tiles.map(t => (
          <div key={t.id} style={{
            flexShrink: 0, width: 76, padding: "12px 8px 10px",
            background: "linear-gradient(180deg, #181818, #131313)",
            border: `1px solid ${HAIRLINE}`, borderRadius: 16,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            position: "relative",
          }}>
            {t.badge && (
              <span style={{
                position: "absolute", top: 6, right: 6,
                padding: "2px 5px", borderRadius: 6,
                background: GOLD, color: "#1A1308",
                fontFamily: "'JetBrains Mono', monospace", fontSize: 8, fontWeight: 600,
              }}>−{t.badge}</span>
            )}
            {t.dot && (
              <span style={{
                position: "absolute", top: 8, right: 8, width: 6, height: 6, borderRadius: 99,
                background: "#E8755B", boxShadow: "0 0 8px rgba(232,117,91,0.5)",
              }}/>
            )}
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "rgba(255,255,255,0.04)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{t.glyph(20, GOLD)}</div>
            <span style={{ fontSize: 11, color: TEXT_MUTED, textAlign: "center" }}>{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────── Proactive AI card ───────────────
function ProactiveCard({ tag, title, body, cta, onClick, accent = false }) {
  return (
    <div onClick={onClick} style={{
      padding: 14, borderRadius: 16, cursor: "pointer",
      background: accent
        ? "linear-gradient(180deg, rgba(212,175,109,0.06), rgba(212,175,109,0.015))"
        : "linear-gradient(180deg, #181818, #131313)",
      border: `1px solid ${accent ? HAIRLINE_GOLD : HAIRLINE}`,
      animation: "float-up 0.5s ease-out both",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <Spark size={9} color={accent ? GOLD : GOLD_DIM} />
        <Mono size={9} color={accent ? GOLD : GOLD_DIM}>{tag}</Mono>
        <span style={{ flex: 1 }}/>
        <Mono size={8} color={TEXT_DIM}>сейчас</Mono>
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", lineHeight: 1.25 }}>{title}</div>
      <div style={{ marginTop: 4, fontSize: 13, color: TEXT_MUTED, lineHeight: 1.4 }}>{body}</div>
      <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, color: accent ? GOLD : "#fff", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
          {cta} {Glyph.arrowRight(12, accent ? GOLD : "#fff")}
        </span>
        <span style={{ fontSize: 11, color: TEXT_DIM }}>Скрыть</span>
      </div>
    </div>
  );
}

window.CarScreen = CarScreen;
