import type { Project, VisualKind } from "@/content/projects";
import { STAGES } from "@/lib/pipeline";

/**
 * Art-directed schematics, one per project, drawn in SVG from what the code actually does.
 * They are diagrams, not screenshots, and the caption on every use says so.
 * All share one frame, one stroke weight and one accent so they read as a set.
 */

const PAPER = "var(--fg)";
const MUTE = "var(--fg-2)";
const LIME = "var(--accent)";
const LINE = "color-mix(in srgb, var(--fg) 30%, transparent)";
const FAINT = "color-mix(in srgb, var(--fg) 9%, transparent)";

const mono = {
  fontFamily: "var(--font-mono)",
  fontSize: 10.5,
  letterSpacing: "0.08em",
} as const;

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 800 500" className="h-full w-full" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid slice">
      <rect width="800" height="500" fill="var(--surface-2)" />
      {/* drafting grid */}
      {Array.from({ length: 15 }, (_, i) => (
        <line key={`v${i}`} x1={50 + i * 50} y1="0" x2={50 + i * 50} y2="500" stroke={FAINT} />
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <line key={`h${i}`} x1="0" y1={50 + i * 50} x2="800" y2={50 + i * 50} stroke={FAINT} />
      ))}
      {/* registration marks */}
      {[
        [36, 36],
        [764, 36],
        [36, 464],
        [764, 464],
      ].map(([x, y]) => (
        <path key={`${x}-${y}`} d={`M${x - 8} ${y}H${x + 8}M${x} ${y - 8}V${y + 8}`} stroke={MUTE} strokeWidth="1" />
      ))}
      {children}
    </svg>
  );
}

function Orders() {
  const channels = ["WEBSITE", "MINI APP", "TELEGRAM", "PHONE"];
  const states = ["NEW", "ACCEPTED", "PREPARING", "READY", "ASSIGNED", "ON THE WAY", "DELIVERED"];
  const current = 3;
  const ledger = [
    ["01", "PAYMENT", "CASH", "+100.00"],
    ["02", "REVERSAL", "CASH", "−100.00"],
    ["03", "PAYMENT", "CASH", "+80.00"],
    ["04", "PAYMENT", "CARD", "+20.00"],
  ];
  return (
    <Frame>
      {channels.map((label, i) => {
        const y = 96 + i * 44;
        return (
          <g key={label}>
            <text x="56" y={y + 4} fill={MUTE} {...mono}>
              {label}
            </text>
            <path d={`M150 ${y} C205 ${y}, 205 162, 258 162`} fill="none" stroke={LINE} strokeWidth="1.2" />
          </g>
        );
      })}
      <rect x="258" y="124" width="112" height="76" fill="var(--surface)" stroke={PAPER} strokeWidth="1.2" />
      <text x="314" y="158" textAnchor="middle" fill={PAPER} {...mono}>
        ONE ORDER
      </text>
      <text x="314" y="175" textAnchor="middle" fill={PAPER} {...mono}>
        ENGINE
      </text>

      <line x1="370" y1="162" x2="752" y2="162" stroke={LINE} strokeWidth="1.2" />
      <line x1="370" y1="162" x2={400 + current * 55} y2="162" stroke={PAPER} strokeWidth="1.2" />
      {states.map((label, i) => {
        const x = 400 + i * 55;
        const isCurrent = i === current;
        return (
          <g key={label}>
            {isCurrent ? <circle cx={x} cy="162" r="11" fill="none" stroke={LIME} strokeWidth="1" opacity="0.5" /> : null}
            <circle
              cx={x}
              cy="162"
              r="5"
              fill={isCurrent ? LIME : i < current ? PAPER : "var(--surface-2)"}
              stroke={isCurrent ? LIME : i < current ? PAPER : MUTE}
              strokeWidth="1.2"
            />
            <text x={x} y={i % 2 ? 196 : 138} textAnchor="middle" fill={isCurrent ? LIME : MUTE} {...mono} fontSize="9.5">
              {label}
            </text>
          </g>
        );
      })}

      <text x="258" y="262" fill={PAPER} {...mono}>
        PAYMENT LEDGER
      </text>
      <text x="752" y="262" textAnchor="end" fill={MUTE} {...mono}>
        APPEND ONLY
      </text>
      <line x1="258" y1="274" x2="752" y2="274" stroke={PAPER} strokeWidth="1" />
      {ledger.map(([n, kind, method, amount], i) => {
        const y = 300 + i * 34;
        const reversed = i < 2;
        return (
          <g key={n} opacity={reversed ? 0.55 : 1}>
            <text x="258" y={y} fill={MUTE} {...mono}>
              {n}
            </text>
            <text x="300" y={y} fill={PAPER} {...mono}>
              {kind}
            </text>
            <text x="430" y={y} fill={MUTE} {...mono}>
              {method}
            </text>
            <text x="752" y={y} textAnchor="end" fill={PAPER} {...mono} fontSize="12">
              {amount}
            </text>
            <line x1="258" y1={y + 12} x2="752" y2={y + 12} stroke={LINE} />
          </g>
        );
      })}
      <text x="258" y="446" fill={MUTE} {...mono}>
        RECEIVED 100.00
      </text>
      <text x="752" y="446" textAnchor="end" fill={LIME} {...mono}>
        OUTSTANDING 0.00
      </text>

      <text x="56" y="300" fill={MUTE} {...mono}>
        DELIVERY PIN
      </text>
      <g>
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={56 + i * 30} y="314" width="22" height="28" fill="none" stroke={i < 2 ? PAPER : LINE} strokeWidth="1.2" />
        ))}
        <circle cx="67" cy="328" r="3" fill={PAPER} />
        <circle cx="97" cy="328" r="3" fill={PAPER} />
      </g>
    </Frame>
  );
}

function Beds() {
  type Bed = "occupied" | "vacant" | "notice";
  const rooms: { name: string; beds: Bed[] }[] = [
    { name: "ROOM 101 · AC", beds: ["occupied", "occupied", "vacant"] },
    { name: "ROOM 102", beds: ["occupied", "notice"] },
    { name: "ROOM 201 · AC", beds: ["occupied", "occupied", "occupied", "vacant"] },
    { name: "ROOM 202", beds: ["vacant", "occupied"] },
  ];
  return (
    <Frame>
      {rooms.map((room, r) => {
        const x = 56 + (r % 2) * 196;
        const y = 76 + Math.floor(r / 2) * 176;
        return (
          <g key={room.name}>
            <rect x={x} y={y} width="176" height="156" fill="var(--surface)" stroke={LINE} strokeWidth="1.2" />
            <text x={x + 14} y={y + 26} fill={MUTE} {...mono}>
              {room.name}
            </text>
            {room.beds.map((bed, b) => {
              const bx = x + 14 + (b % 2) * 78;
              const by = y + 44 + Math.floor(b / 2) * 52;
              return (
                <g key={b}>
                  <rect
                    x={bx}
                    y={by}
                    width="66"
                    height="40"
                    rx="2"
                    fill={bed === "occupied" ? PAPER : "none"}
                    stroke={bed === "vacant" ? LIME : bed === "notice" ? PAPER : "none"}
                    strokeWidth="1.4"
                    strokeDasharray={bed === "notice" ? "4 4" : undefined}
                  />
                  <rect x={bx + 6} y={by + 6} width="14" height="28" rx="1" fill={bed === "occupied" ? "var(--surface-2)" : "none"} stroke={bed === "occupied" ? "none" : LINE} />
                </g>
              );
            })}
          </g>
        );
      })}

      <rect x="492" y="76" width="252" height="74" fill="none" stroke={LINE} strokeWidth="1.2" strokeDasharray="5 5" />
      <text x="508" y="104" fill={MUTE} {...mono}>
        LISTING
      </text>
      <text x="508" y="128" fill={PAPER} fontFamily="var(--font-display)" fontWeight="700" fontSize="22">
        the advert
      </text>

      <path d="M618 150V194" stroke={PAPER} strokeWidth="1.2" />
      <path d="M612 186l6 9 6-9" fill="none" stroke={PAPER} strokeWidth="1.2" />
      <text x="634" y="178" fill={MUTE} {...mono}>
        RECONCILE
      </text>

      <rect x="492" y="196" width="252" height="74" fill="var(--surface)" stroke={PAPER} strokeWidth="1.2" />
      <text x="508" y="224" fill={MUTE} {...mono}>
        PROPERTY
      </text>
      <text x="508" y="248" fill={PAPER} fontFamily="var(--font-display)" fontWeight="700" fontSize="22">
        the truth
      </text>

      {[
        ["VACANT BEDS", "3 / 11", LIME],
        ["ON NOTICE", "1", PAPER],
        ["OCCUPIED", "7", PAPER],
      ].map(([label, value, colour], i) => (
        <g key={label}>
          <text x="492" y={318 + i * 38} fill={MUTE} {...mono}>
            {label}
          </text>
          <text x="744" y={318 + i * 38} textAnchor="end" fill={colour} {...mono} fontSize="13">
            {value}
          </text>
          <line x1="492" y1={330 + i * 38} x2="744" y2={330 + i * 38} stroke={LINE} />
        </g>
      ))}
    </Frame>
  );
}

function Pipeline() {
  const step = 680 / (STAGES.length - 1);
  const reached = 8;
  const shots = [1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0];
  return (
    <Frame>
      <line x1="60" y1="196" x2="740" y2="196" stroke={LINE} strokeWidth="1.2" />
      <line x1="60" y1="196" x2={60 + reached * step} y2="196" stroke={PAPER} strokeWidth="1.2" />
      {STAGES.map((stage, i) => {
        const x = 60 + i * step;
        const done = i < reached;
        const isCurrent = i === reached;
        const colour = isCurrent ? LIME : done ? PAPER : MUTE;
        return (
          <g key={stage.id}>
            {stage.checkpoint ? (
              <rect
                x={x - 6}
                y={190}
                width="12"
                height="12"
                transform={`rotate(45 ${x} 196)`}
                fill={done ? PAPER : "var(--surface-2)"}
                stroke={colour}
                strokeWidth="1.2"
              />
            ) : (
              <circle cx={x} cy="196" r="5" fill={isCurrent ? LIME : done ? PAPER : "var(--surface-2)"} stroke={colour} strokeWidth="1.2" />
            )}
            <text x={x + 4} y="174" fill={colour} {...mono} fontSize="9.5" transform={`rotate(-48 ${x + 4} 174)`}>
              {stage.title.toUpperCase()}
            </text>
          </g>
        );
      })}
      <path d={`M${60 + step - 10} 222v8H${60 + 6 * step + 10}v-8`} fill="none" stroke={MUTE} strokeWidth="1" />
      <text x={60 + 3.5 * step} y="250" textAnchor="middle" fill={MUTE} {...mono}>
        SIX REVIEW CHECKPOINTS
      </text>

      {shots.map((clip, i) => {
        const x = 60 + i * 57;
        return (
          <g key={i}>
            <rect x={x} y="318" width="50" height="76" fill={clip ? "color-mix(in srgb, var(--fg) 10%, transparent)" : "none"} stroke={clip ? PAPER : LINE} strokeWidth="1.2" />
            {clip ? <path d={`M${x + 20} ${346}l14 10-14 10z`} fill={PAPER} /> : <path d={`M${x + 16} 356h18`} stroke={MUTE} strokeWidth="1.2" />}
            <text x={x + 25} y="412" textAnchor="middle" fill={MUTE} {...mono} fontSize="9">
              {String(i + 1).padStart(2, "0")}
            </text>
          </g>
        );
      })}
      <text x="60" y="302" fill={PAPER} {...mono}>
        EXPORT LABEL
      </text>
      <text x="740" y="302" textAnchor="end" fill={LIME} {...mono}>
        MIXED: 6 OF 12 SHOTS ANIMATED
      </text>
      <text x="60" y="446" fill={MUTE} {...mono}>
        ▸ GENERATED CLIP &nbsp;&nbsp; — DIRECTED STILL
      </text>
    </Frame>
  );
}

function Listings() {
  const fields = [
    ["BUSINESS NAME", 180],
    ["INDUSTRY", 120],
    ["ANNUAL REVENUE", 96],
    ["ASKING PRICE", 110],
  ] as const;
  const flow = ["DRAFT", "IN REVIEW", "APPROVED", "CHANGE REQUESTED", "APPROVED"];
  return (
    <Frame>
      <rect x="56" y="70" width="400" height="360" fill="var(--surface)" stroke={LINE} strokeWidth="1.2" />
      {fields.map(([label, width], i) => (
        <g key={label}>
          <text x="80" y={108 + i * 48} fill={MUTE} {...mono}>
            {label}
          </text>
          <rect x="80" y={118 + i * 48} width={width} height="8" fill="color-mix(in srgb, var(--fg) 50%, transparent)" />
          <line x1="80" y1={136 + i * 48} x2="432" y2={136 + i * 48} stroke={LINE} />
        </g>
      ))}
      <text x="80" y="306" fill={MUTE} {...mono}>
        DESCRIPTION
      </text>
      <rect x="80" y="318" width="352" height="88" fill="none" stroke={LIME} strokeWidth="1.2" />
      {[300, 320, 250].map((w, i) => (
        <rect key={i} x="94" y={334 + i * 18} width={w} height="7" fill={LIME} opacity="0.75" />
      ))}
      <text x="432" y="306" textAnchor="end" fill={LIME} {...mono}>
        SUGGESTION · ACCEPT / DISCARD
      </text>

      <line x1="540" y1="96" x2="540" y2="404" stroke={LINE} strokeWidth="1.2" />
      <line x1="540" y1="96" x2="540" y2="173" stroke={PAPER} strokeWidth="1.2" />
      {flow.map((label, i) => {
        const y = 96 + i * 77;
        const isCurrent = i === 1;
        return (
          <g key={`${label}-${i}`}>
            <circle cx="540" cy={y} r="5" fill={isCurrent ? LIME : i < 1 ? PAPER : "var(--surface-2)"} stroke={isCurrent ? LIME : i < 1 ? PAPER : MUTE} strokeWidth="1.2" />
            <text x="560" y={y + 4} fill={isCurrent ? LIME : i < 1 ? PAPER : MUTE} {...mono}>
              {label}
            </text>
          </g>
        );
      })}
      <text x="560" y="442" fill={MUTE} {...mono}>
        EDITS ARE PROPOSALS
      </text>
    </Frame>
  );
}

function Nodes() {
  const nodes = [
    { x: 56, y: 96, label: "LOAD MODEL" },
    { x: 56, y: 236, label: "ENCODE PROMPT" },
    { x: 316, y: 156, label: "SAMPLE" },
    { x: 516, y: 96, label: "DECODE" },
    { x: 596, y: 236, label: "SAVE + VERIFY" },
  ];
  const wire = (a: number, b: number) => {
    const from = nodes[a];
    const to = nodes[b];
    const x1 = from.x + 148;
    const y1 = from.y + 38;
    const x2 = to.x;
    const y2 = to.y + 38;
    const mid = (x1 + x2) / 2;
    return `M${x1} ${y1} C${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`;
  };
  const ladder = ["TILED DECODE", "LOWER RESOLUTION", "FEWER FRAMES"];
  return (
    <Frame>
      {[
        [0, 2],
        [1, 2],
        [2, 3],
        [3, 4],
      ].map(([a, b]) => (
        <path key={`${a}-${b}`} d={wire(a, b)} fill="none" stroke={a === 2 ? LIME : PAPER} strokeWidth="1.2" opacity={a === 2 ? 1 : 0.6} />
      ))}
      {nodes.map((node) => (
        <g key={node.label}>
          <rect x={node.x} y={node.y} width="148" height="76" fill="var(--surface)" stroke={LINE} strokeWidth="1.2" />
          <rect x={node.x} y={node.y} width="148" height="22" fill="color-mix(in srgb, var(--fg) 8%, transparent)" />
          <text x={node.x + 10} y={node.y + 15} fill={PAPER} {...mono} fontSize="9.5">
            {node.label}
          </text>
          <circle cx={node.x} cy={node.y + 38} r="3.5" fill="var(--surface-2)" stroke={MUTE} />
          <circle cx={node.x + 148} cy={node.y + 38} r="3.5" fill={PAPER} />
          <rect x={node.x + 12} y={node.y + 52} width="70" height="5" fill="color-mix(in srgb, var(--fg) 22%, transparent)" />
        </g>
      ))}

      <text x="56" y="372" fill={PAPER} {...mono}>
        OUT-OF-MEMORY LADDER
      </text>
      {ladder.map((label, i) => (
        <g key={label}>
          <rect x={56 + i * 190} y="388" width="176" height="40" fill="none" stroke={i === 0 ? LIME : LINE} strokeWidth="1.2" />
          <text x={56 + i * 190 + 88} y="412" textAnchor="middle" fill={i === 0 ? LIME : MUTE} {...mono}>
            {label}
          </text>
          {i < ladder.length - 1 ? <path d={`M${232 + i * 190} 408h14`} stroke={MUTE} strokeWidth="1.2" /> : null}
        </g>
      ))}
      <text x="744" y="372" textAnchor="end" fill={MUTE} {...mono}>
        SAME SEED, SAME PROMPT
      </text>
    </Frame>
  );
}

function Voice() {
  const bars = Array.from({ length: 78 }, (_, i) => {
    const envelope = Math.sin((i / 77) * Math.PI) * 0.6 + 0.4;
    const wave = Math.abs(Math.sin(i * 0.9) * 0.6 + Math.sin(i * 0.37 + 1) * 0.4);
    return 10 + wave * envelope * 128;
  });
  const chain = ["KOKORO", "GPT-SOVITS", "SYSTEM VOICE", "SILENCE"];
  return (
    <Frame>
      {bars.map((height, i) => {
        const x = 56 + i * 8.9;
        const spoken = i > 22 && i < 46;
        return <rect key={i} x={x} y={178 - height / 2} width="4" height={height} fill={spoken ? LIME : PAPER} opacity={spoken ? 1 : 0.5} />;
      })}
      <text x="56" y="78" fill={MUTE} {...mono}>
        LINE 07 · ONE VOICE PER CHARACTER
      </text>
      <path d="M260 268v10h206v-10" fill="none" stroke={LIME} strokeWidth="1" />
      <text x="363" y="296" textAnchor="middle" fill={LIME} {...mono}>
        VOICED
      </text>

      <text x="56" y="358" fill={PAPER} {...mono}>
        FALLBACK, PER LINE
      </text>
      {chain.map((label, i) => (
        <g key={label}>
          <rect x={56 + i * 174} y="374" width="158" height="44" fill={i === 0 ? "var(--surface)" : "none"} stroke={i === 0 ? PAPER : LINE} strokeWidth="1.2" strokeDasharray={i === 3 ? "4 4" : undefined} />
          <text x={56 + i * 174 + 79} y="400" textAnchor="middle" fill={i === 0 ? PAPER : MUTE} {...mono}>
            {label}
          </text>
          {i < chain.length - 1 ? <path d={`M${214 + i * 174} 396h16`} stroke={MUTE} strokeWidth="1.2" /> : null}
        </g>
      ))}
    </Frame>
  );
}

function Plate({ title, caption }: { title: string; caption: string }) {
  return (
    <Frame>
      {[180, 130, 80].map((r) => (
        <circle key={r} cx="560" cy="250" r={r} fill="none" stroke={LINE} strokeWidth="1.2" />
      ))}
      <line x1="560" y1="40" x2="560" y2="460" stroke={LINE} />
      <line x1="340" y1="250" x2="780" y2="250" stroke={LINE} />
      <circle cx="560" cy="250" r="5" fill={LIME} />
      <text x="56" y="232" fill={PAPER} fontFamily="var(--font-display)" fontWeight="800" fontSize="74" letterSpacing="-0.04em">
        {title}
      </text>
      <line x1="56" y1="262" x2="320" y2="262" stroke={PAPER} strokeWidth="1.2" />
      <text x="56" y="290" fill={MUTE} {...mono}>
        {caption}
      </text>
    </Frame>
  );
}

const captions: Record<VisualKind, string> = {
  orders: "Schematic of the order engine and payment ledger. Drawn from the code, not a screenshot.",
  beds: "Schematic of the rooms-and-beds capacity model. Drawn from the code, not a screenshot.",
  pipeline: "Schematic of the thirteen-stage pipeline and its export label. Drawn from the code, not footage.",
  listings: "Schematic of the listing form and review flow. Drawn from the code, not a screenshot.",
  nodes: "Schematic of a generation workflow and its memory ladder. Not a screenshot.",
  voice: "Schematic of the per-line voice fallback chain. Not a recording.",
  plate: "Title plate. The live site is linked on this page.",
};

export function visualCaption(project: Project) {
  // Projects added in the panel get a plate whether or not they have a link, so only promise one that exists.
  if (project.visual === "plate" && project.links.length === 0) return "Title plate, not a screenshot.";
  return captions[project.visual];
}

export function ProjectVisual({ project }: { project: Project }) {
  switch (project.visual) {
    case "orders":
      return <Orders />;
    case "beds":
      return <Beds />;
    case "pipeline":
      return <Pipeline />;
    case "listings":
      return <Listings />;
    case "nodes":
      return <Nodes />;
    case "voice":
      return <Voice />;
    case "plate":
      return <Plate title={project.title} caption={(project.links[0]?.label ?? project.category).toUpperCase()} />;
  }
}
