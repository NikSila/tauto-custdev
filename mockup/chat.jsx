// chat.jsx — AI chat screen, agent flow, voice screen

// ──────────────────────────────────────────────────────────────
// SCREEN 2 — AI CHAT
// ──────────────────────────────────────────────────────────────
function ChatScreen({ goto, onTaskOpen }) {
  const [messages, setMessages] = React.useState(initialMessages());
  const [input, setInput] = React.useState("");
  const [streaming, setStreaming] = React.useState(false);
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, streaming]);

  function send(text) {
    if (!text.trim()) return;
    setMessages(m => [...m, { role: "user", text }]);
    setInput("");
    setStreaming(true);
    setTimeout(() => {
      setStreaming(false);
      setMessages(m => [...m, autoReply(text)]);
    }, 1100);
  }

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", background: "#0a0a0a", paddingTop: 48 }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", padding: "10px 16px 12px",
        borderBottom: `1px solid ${HAIRLINE}`, gap: 12, position: "relative",
      }}>
        <IconButton onClick={() => goto("car")} size={32}>{Glyph.back(16)}</IconButton>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Spark size={11} animate />
            <ConciergeMark size={11} />
          </div>
          <div style={{ fontSize: 11, color: GOLD_DIM, marginTop: 2, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.08em" }}>
            <span style={{
              display: "inline-block", width: 5, height: 5, borderRadius: 99,
              background: GOLD, marginRight: 5, animation: "pulse-gold 1.6s ease-in-out infinite",
            }}/>
            Активен · Kia Sportage
          </div>
        </div>
        <IconButton size={32}>{Glyph.more(16)}</IconButton>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="phone-scroll" style={{
        flex: 1, overflowY: "auto", padding: "20px 16px 8px",
      }}>
        {messages.map((m, i) => (
          <Message key={i} {...m} onTaskOpen={onTaskOpen} />
        ))}
        {streaming && <TypingIndicator />}
      </div>

      {/* Quick actions */}
      <QuickReplies onPick={send} />

      {/* Composer */}
      <Composer
        value={input}
        onChange={setInput}
        onSend={() => send(input)}
        onMic={() => goto("voice")}
      />
    </div>
  );
}

// ─────────────── Initial chat content ───────────────
function initialMessages() {
  return [
    { role: "ai", date: "Сегодня · 14:02", text: "Доброе утро, Анна. Я просмотрел машину сегодня в 8:30 — ничего срочного, но три вещи стоит решить на этой неделе." },
    {
      role: "ai",
      cards: [
        {
          tag: "Сервис · ТО",
          title: "Запись на ТО — 80 000 км",
          subtitle: "Через 412 км пробега",
          rows: [
            { label: "АвтоПрестиж", meta: "ср · 11:00 · 14 200 ₽", best: true },
            { label: "Континент", meta: "пт · 09:30 · 15 800 ₽" },
            { label: "СитиСервис", meta: "сб · 14:15 · 13 900 ₽" },
          ],
          cta: "Забронировать у АвтоПрестижа",
          taskKey: "service",
        }
      ],
    },
    { role: "user", text: "Сколько я потратил на машину в этом месяце?" },
    {
      role: "ai",
      text: "В апреле — 18 460 ₽. На 14% меньше марта.",
      breakdown: [
        { label: "Топливо", value: "9 200 ₽", w: 50 },
        { label: "Транспондер", value: "2 460 ₽", w: 13 },
        { label: "Мойка", value: "3 600 ₽", w: 20 },
        { label: "Штраф", value: "500 ₽", w: 3 },
        { label: "Замена щёток", value: "2 700 ₽", w: 14 },
      ],
    },
  ];
}

// ─────────────── Auto-reply (simple) ───────────────
function autoReply(text) {
  const t = text.toLowerCase();
  if (t.includes("штраф")) {
    return { role: "ai", text: "Штраф ГИБДД 500 ₽ от 03 мая. Со скидкой 50% — 250 ₽. Списать с карты *4421?", quickConfirm: ["Да, оплатить", "Подробнее"] };
  }
  if (t.includes("заправ") || t.includes("азс")) {
    return { role: "ai", text: "ЛУКОЙЛ на Челюскинцев — 53,90 ₽/л. По пути домой, +2 минуты. Построить маршрут?", quickConfirm: ["Маршрут", "Не сейчас"] };
  }
  if (t.includes("прода") || t.includes("оценк")) {
    return { role: "ai", text: "Текущая оценка — 2 778 599 ₽. Это +1.4% за 3 недели. На рынке 47 машин в вашей комплектации, медианная цена 2 720 000 ₽. Подготовить объявление?" };
  }
  return { role: "ai", text: "Я зафиксировал. Хотите, я напомню вам об этом завтра в 9:00?" };
}

// ─────────────── Message renderer ───────────────
function Message({ role, text, date, cards, breakdown, quickConfirm, onTaskOpen }) {
  if (role === "user") {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14, animation: "float-up 0.3s ease-out both" }}>
        <div style={{
          maxWidth: "78%", padding: "10px 14px", borderRadius: 18, borderBottomRightRadius: 6,
          background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 14, lineHeight: 1.4,
          border: `1px solid ${HAIRLINE}`,
        }}>{text}</div>
      </div>
    );
  }
  // AI
  return (
    <div style={{ marginBottom: 16, animation: "float-up 0.4s ease-out both" }}>
      {date && (
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <Mono size={9} color={TEXT_DIM}>{date}</Mono>
        </div>
      )}
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <div style={{
          width: 26, height: 26, borderRadius: 99, flexShrink: 0,
          background: "radial-gradient(circle at 30% 30%, #2a2014, #0a0a0a)",
          border: `1px solid ${HAIRLINE_GOLD}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Spark size={11} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {text && (
            <div style={{
              padding: "10px 14px", borderRadius: 18, borderBottomLeftRadius: 6,
              background: "linear-gradient(180deg, #181818, #131313)",
              border: `1px solid ${HAIRLINE}`,
              fontSize: 14, lineHeight: 1.45, color: "#fff", display: "inline-block", maxWidth: "100%",
            }}>{text}</div>
          )}

          {breakdown && <ExpenseBreakdown items={breakdown} />}

          {cards && cards.map((c, i) => <TaskCard key={i} card={c} onOpen={() => onTaskOpen(c.taskKey)} />)}

          {quickConfirm && (
            <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
              {quickConfirm.map((q, i) => (
                <button key={i} style={{
                  padding: "6px 12px", borderRadius: 99,
                  background: i === 0 ? GOLD : "transparent",
                  color: i === 0 ? "#1A1308" : GOLD,
                  border: i === 0 ? "none" : `1px solid ${HAIRLINE_GOLD}`,
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}>{q}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────── Task card (booking, etc.) ───────────────
function TaskCard({ card, onOpen }) {
  return (
    <div style={{
      marginTop: 10, padding: 14, borderRadius: 16,
      background: "linear-gradient(180deg, rgba(212,175,109,0.06), rgba(212,175,109,0.015))",
      border: `1px solid ${HAIRLINE_GOLD}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <Mono size={9} color={GOLD}>{card.tag}</Mono>
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 2 }}>{card.title}</div>
      <div style={{ fontSize: 12, color: TEXT_DIM, marginBottom: 12 }}>{card.subtitle}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {card.rows.map((r, i) => (
          <div key={i} style={{
            padding: "10px 12px", borderRadius: 11,
            background: r.best ? "rgba(212,175,109,0.08)" : "rgba(255,255,255,0.02)",
            border: `1px solid ${r.best ? HAIRLINE_GOLD : HAIRLINE}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <div style={{ fontSize: 13, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
                {r.label}
                {r.best && <span style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 8,
                  color: GOLD, padding: "1px 5px", border: `1px solid ${HAIRLINE_GOLD}`,
                  borderRadius: 4, letterSpacing: "0.1em",
                }}>ЛУЧШЕЕ</span>}
              </div>
              <div style={{ fontSize: 11, color: TEXT_DIM, marginTop: 2 }}>{r.meta}</div>
            </div>
            <span style={{
              width: 16, height: 16, borderRadius: 99,
              border: `1.5px solid ${r.best ? GOLD : "rgba(255,255,255,0.2)"}`,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
            }}>
              {r.best && <span style={{ width: 8, height: 8, borderRadius: 99, background: GOLD }}/>}
            </span>
          </div>
        ))}
      </div>
      <button onClick={onOpen} style={{
        width: "100%", marginTop: 12, height: 42, borderRadius: 11,
        background: "linear-gradient(180deg, #E8C988, #C7A05B)",
        border: "none", color: "#1A1308", fontSize: 13, fontWeight: 600,
        cursor: "pointer", boxShadow: "0 4px 14px rgba(212,175,109,0.18)",
      }}>{card.cta}</button>
    </div>
  );
}

// ─────────────── Expense breakdown ───────────────
function ExpenseBreakdown({ items }) {
  return (
    <div style={{
      marginTop: 8, padding: 14, borderRadius: 16,
      background: "linear-gradient(180deg, #181818, #131313)",
      border: `1px solid ${HAIRLINE}`,
    }}>
      <Mono size={9} color={TEXT_DIM}>Апрель · 18 460 ₽</Mono>
      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((it, i) => (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: TEXT_MUTED }}>{it.label}</span>
              <span style={{ color: "#fff", fontFamily: "'JetBrains Mono', monospace" }}>{it.value}</span>
            </div>
            <div style={{ height: 3, background: "rgba(255,255,255,0.04)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                "--p": `${it.w}%`, height: "100%",
                background: i === 0 ? GOLD : `rgba(212,175,109,${0.4 + i * 0.05})`,
                width: `${it.w}%`,
                animation: "progress-fill 0.7s ease-out both",
              }}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────── Typing indicator ───────────────
function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
      <div style={{
        width: 26, height: 26, borderRadius: 99, flexShrink: 0,
        background: "radial-gradient(circle at 30% 30%, #2a2014, #0a0a0a)",
        border: `1px solid ${HAIRLINE_GOLD}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Spark size={11} animate />
      </div>
      <div style={{
        padding: "12px 16px", borderRadius: 18, borderBottomLeftRadius: 6,
        background: "linear-gradient(180deg, #181818, #131313)",
        border: `1px solid ${HAIRLINE}`,
        display: "flex", gap: 4, alignItems: "center",
      }}>
        {[0,1,2].map(i => (
          <span key={i} style={{
            width: 6, height: 6, borderRadius: 99, background: GOLD,
            animation: `typing-dot 1.4s ease-in-out ${i * 0.15}s infinite`,
          }}/>
        ))}
      </div>
    </div>
  );
}

// ─────────────── Quick replies ───────────────
function QuickReplies({ onPick }) {
  const replies = [
    "Найди дешёвую АЗС",
    "Сколько я потратил?",
    "Оцени машину",
    "Запиши на мойку",
    "Покажи штрафы",
  ];
  return (
    <div className="phone-scroll" style={{
      display: "flex", gap: 8, padding: "8px 16px 10px", overflowX: "auto",
      borderTop: `1px solid ${HAIRLINE}`,
    }}>
      {replies.map((r, i) => (
        <button key={i} onClick={() => onPick(r)} style={{
          flexShrink: 0, height: 32, padding: "0 14px", borderRadius: 99,
          background: "rgba(212,175,109,0.06)",
          border: `1px solid ${HAIRLINE_GOLD}`,
          color: GOLD, fontSize: 12, fontWeight: 500, cursor: "pointer",
          whiteSpace: "nowrap",
        }}>{r}</button>
      ))}
    </div>
  );
}

// ─────────────── Composer ───────────────
function Composer({ value, onChange, onSend, onMic }) {
  return (
    <div style={{
      padding: "8px 12px 16px", display: "flex", gap: 8, alignItems: "center",
    }}>
      <div style={{
        flex: 1, height: 44, borderRadius: 22, padding: "0 6px 0 16px",
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${HAIRLINE}`,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => e.key === "Enter" && onSend()}
          placeholder="Спросите что-нибудь о машине…"
          style={{
            flex: 1, background: "none", border: "none", outline: "none",
            color: "#fff", fontSize: 14, fontFamily: "inherit",
          }}
        />
        <button onClick={onMic} style={{
          width: 32, height: 32, borderRadius: 99, border: "none",
          background: "rgba(212,175,109,0.1)", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>{Glyph.mic(16, GOLD)}</button>
      </div>
      <button onClick={onSend} style={{
        width: 44, height: 44, borderRadius: 99, border: "none",
        background: value.trim()
          ? "linear-gradient(180deg, #E8C988, #C7A05B)"
          : "rgba(255,255,255,0.04)",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 0.2s",
        boxShadow: value.trim() ? "0 4px 14px rgba(212,175,109,0.3)" : "none",
      }}>{Glyph.send(18, value.trim() ? "#1A1308" : TEXT_DIM)}</button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// SCREEN 3 — AGENT TASK (booking service, multi-step)
// ──────────────────────────────────────────────────────────────
function AgentScreen({ goto }) {
  const [step, setStep] = React.useState(0);
  const steps = [
    { label: "Сравнение цен в 12 сервисах", detail: "ср · 11:00 — лучший слот" },
    { label: "Проверка истории сервиса", detail: "АвтоПрестиж · 4.8 · 312 отзывов" },
    { label: "Резервирование слота", detail: "ср, 6 мая · 11:00–12:30" },
    { label: "Согласование с календарём", detail: "Свободно · в календарь добавлено" },
    { label: "Оплата с карты *4421", detail: "Hold 14 200 ₽ · Cashback 5%" },
  ];

  React.useEffect(() => {
    if (step >= steps.length) return;
    const t = setTimeout(() => setStep(s => s + 1), 1100);
    return () => clearTimeout(t);
  }, [step]);

  const done = step >= steps.length;

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", paddingTop: 48, background: "#0a0a0a" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "10px 16px", gap: 12 }}>
        <IconButton onClick={() => goto("chat")} size={32}>{Glyph.back(16)}</IconButton>
        <div style={{ flex: 1, textAlign: "center" }}>
          <Mono size={9} color={GOLD_DIM}>Concierge выполняет задачу</Mono>
          <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>Запись на ТО</div>
        </div>
        <div style={{ width: 32 }}/>
      </div>

      <div style={{ flex: 1, padding: "20px 18px", overflowY: "auto" }}>
        {/* Big spark */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <div style={{
            width: 88, height: 88, borderRadius: 99, position: "relative",
            background: "radial-gradient(circle at 30% 30%, #2a2014, #0a0a0a)",
            border: `1px solid ${HAIRLINE_GOLD}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 60px rgba(212,175,109,0.18)",
          }}>
            <Spark size={36} animate={!done} />
            {!done && (
              <span style={{
                position: "absolute", inset: -6, borderRadius: 99,
                border: `1px solid ${HAIRLINE_GOLD}`, animation: "pulse-gold 2s ease-in-out infinite",
              }}/>
            )}
          </div>
        </div>

        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Serif size={26} weight={400}>
            {done ? "Готово" : "Бронирую сервис"}
          </Serif>
          <div style={{ marginTop: 6, fontSize: 13, color: TEXT_MUTED }}>
            {done ? "Напомню за день и за час" : `Шаг ${Math.min(step + 1, steps.length)} из ${steps.length}`}
          </div>
        </div>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {steps.map((s, i) => {
            const state = i < step ? "done" : i === step ? "active" : "pending";
            return (
              <div key={i} style={{
                padding: "12px 14px", borderRadius: 14,
                background: state === "active"
                  ? "linear-gradient(180deg, rgba(212,175,109,0.07), rgba(212,175,109,0.02))"
                  : state === "done" ? "rgba(255,255,255,0.02)" : "transparent",
                border: `1px solid ${state === "active" ? HAIRLINE_GOLD : HAIRLINE}`,
                opacity: state === "pending" ? 0.4 : 1,
                display: "flex", alignItems: "center", gap: 12,
                transition: "all 0.4s",
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 99, flexShrink: 0,
                  background: state === "done" ? GOLD : "transparent",
                  border: state === "done" ? "none" : `1.5px solid ${state === "active" ? GOLD : "rgba(255,255,255,0.2)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {state === "done" && Glyph.check(12, "#1A1308")}
                  {state === "active" && (
                    <span style={{
                      width: 8, height: 8, borderRadius: 99, background: GOLD,
                      animation: "pulse-gold 1.2s ease-in-out infinite",
                    }}/>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: state === "pending" ? TEXT_DIM : "#fff" }}>{s.label}</div>
                  {state !== "pending" && (
                    <div style={{ fontSize: 11, color: TEXT_DIM, marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>{s.detail}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {done && (
          <div style={{
            marginTop: 24, padding: 18, borderRadius: 18,
            background: "linear-gradient(180deg, rgba(212,175,109,0.08), rgba(212,175,109,0.02))",
            border: `1px solid ${HAIRLINE_GOLD}`, animation: "float-up 0.5s ease-out both",
          }}>
            <Mono size={9} color={GOLD}>Подтверждение</Mono>
            <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <Serif size={20}>АвтоПрестиж</Serif>
                <div style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 2 }}>ул. Танкистов, 12</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>ср, 6 мая</div>
                <div style={{ fontSize: 12, color: TEXT_DIM, fontFamily: "'JetBrains Mono', monospace" }}>11:00</div>
              </div>
            </div>
            <Hairline gold style={{ margin: "14px 0" }}/>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: TEXT_MUTED }}>Стоимость</span>
              <span style={{ color: "#fff", fontFamily: "'JetBrains Mono', monospace" }}>14 200 ₽</span>
            </div>
            <div style={{ marginTop: 6, display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: TEXT_MUTED }}>Кэшбэк</span>
              <span style={{ color: GOLD, fontFamily: "'JetBrains Mono', monospace" }}>+710 ₽</span>
            </div>
          </div>
        )}
      </div>

      {done && (
        <div style={{ padding: "8px 16px 24px", display: "flex", gap: 8 }}>
          <button onClick={() => goto("chat")} style={{
            flex: 1, height: 48, borderRadius: 999, background: "transparent",
            color: "#fff", border: `1px solid ${HAIRLINE}`, fontSize: 14, cursor: "pointer",
          }}>Закрыть</button>
          <GoldButton onClick={() => goto("car")} style={{ flex: 1 }}>В календарь</GoldButton>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// SCREEN 4 — VOICE
// ──────────────────────────────────────────────────────────────
function VoiceScreen({ goto }) {
  const [phase, setPhase] = React.useState("listening"); // listening, thinking, speaking
  const [transcript, setTranscript] = React.useState("");
  const utterance = "Найди дешёвую заправку по дороге домой";

  React.useEffect(() => {
    if (phase !== "listening") return;
    let i = 0;
    const t = setInterval(() => {
      i++;
      if (i > utterance.length) {
        clearInterval(t);
        setTimeout(() => setPhase("thinking"), 400);
        setTimeout(() => setPhase("speaking"), 1400);
        return;
      }
      setTranscript(utterance.slice(0, i));
    }, 55);
    return () => clearInterval(t);
  }, [phase]);

  return (
    <div style={{
      position: "absolute", inset: 0, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: 24,
      background: "radial-gradient(ellipse at center, #1a1408 0%, #050505 70%)",
    }}>
      {/* Close */}
      <div style={{ position: "absolute", top: 56, right: 18 }}>
        <IconButton onClick={() => goto("chat")} size={36}>{Glyph.close(16)}</IconButton>
      </div>

      {/* Concierge mark top */}
      <div style={{ position: "absolute", top: 64, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 6 }}>
        <Spark size={10} animate />
        <Mono size={9} color={GOLD}>{phase === "listening" ? "Слушаю" : phase === "thinking" ? "Думаю" : "Отвечаю"}</Mono>
      </div>

      {/* Orb */}
      <div style={{ position: "relative", width: 240, height: 240, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Halos */}
        {[0,1,2].map(i => (
          <div key={i} style={{
            position: "absolute", width: 240, height: 240, borderRadius: 99,
            border: `1px solid ${HAIRLINE_GOLD}`,
            transform: `scale(${1 - i * 0.15})`,
            opacity: 0.4 - i * 0.1,
            animation: `pulse-gold ${2 + i * 0.6}s ease-in-out infinite`,
          }}/>
        ))}
        <div style={{
          width: 140, height: 140, borderRadius: 99,
          background: "radial-gradient(circle at 35% 30%, #5a4520 0%, #2a1f10 50%, #0a0a0a 100%)",
          boxShadow: "0 0 80px rgba(212,175,109,0.3), inset 0 0 40px rgba(212,175,109,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Spark size={56} animate />
        </div>
      </div>

      {/* Transcript */}
      <div style={{ marginTop: 36, minHeight: 80, textAlign: "center", maxWidth: 320 }}>
        {phase === "listening" && (
          <Serif size={22} weight={400} color="#fff">
            {transcript}
            <span style={{ animation: "streamCursor 0.9s steps(1) infinite", color: GOLD }}>|</span>
          </Serif>
        )}
        {phase === "thinking" && <Serif size={22} color={TEXT_DIM}>{utterance}</Serif>}
        {phase === "speaking" && (
          <div>
            <Serif size={20} color="#fff">
              ЛУКОЙЛ на Челюскинцев — 92‑й по 53,90 ₽. Дешевле обычной на 4,80 ₽. По пути, +2 минуты.
            </Serif>
            <div style={{ marginTop: 18, display: "flex", gap: 10, justifyContent: "center" }}>
              <GoldButton small>Маршрут</GoldButton>
              <button style={{
                height: 36, padding: "0 16px", borderRadius: 99, background: "transparent",
                color: TEXT_MUTED, border: `1px solid ${HAIRLINE}`, fontSize: 13, cursor: "pointer",
              }}>Не сейчас</button>
            </div>
          </div>
        )}
      </div>

      {/* Wave bars */}
      <div style={{ position: "absolute", bottom: 80, display: "flex", gap: 4, alignItems: "center", height: 40 }}>
        {Array.from({ length: 24 }).map((_, i) => (
          <span key={i} style={{
            width: 3, height: 24, borderRadius: 2, background: GOLD, opacity: 0.7,
            animation: `wave ${0.7 + (i % 5) * 0.15}s ease-in-out ${i * 0.04}s infinite`,
            transformOrigin: "center",
          }}/>
        ))}
      </div>

      {/* Mic */}
      <div style={{ position: "absolute", bottom: 22 }}>
        <button onClick={() => goto("chat")} style={{
          width: 56, height: 56, borderRadius: 99, border: "none",
          background: "linear-gradient(180deg, #E8C988, #C7A05B)",
          cursor: "pointer", boxShadow: "0 6px 20px rgba(212,175,109,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>{Glyph.mic(22, "#1A1308")}</button>
      </div>
    </div>
  );
}

Object.assign(window, { ChatScreen, AgentScreen, VoiceScreen });
