// =========================================================
// MyoTrack — 운동 / 실시간 측정 / 운동 결과 화면 (피드백 + 영상 추천 담당 부분)
// 맨 아래 "테스트 값 바꾸기"를 열어 숫자를 바꾸면 화면이 바로 바뀐다.
// (나중에는 이 숫자들이 센서·백엔드에서 자동으로 들어온다)
// =========================================================
import { useState } from "react";
import "./App.css";
import {
  liveFeedback,
  sessionFeedback,
  nextSession,
  recommendVideos,
  preExerciseVideos,
  completionRate,
  MIN_REST_SEC,
} from "./recommend";
import type { Plan, SessionResult, FeedbackItem, VideoCard, Tone } from "./recommend";

type View = "before" | "live" | "result";

export default function App() {
  const [view, setView] = useState<View>("result");

  // ----- 운동 계획 (사용자가 전문가 지시대로 입력하는 값) -----
  const [targetReps, setTargetReps] = useState(10);
  const [targetHold, setTargetHold] = useState(2);
  const [allowIncrease, setAllowIncrease] = useState(true);
  const [maxReps, setMaxReps] = useState(15);

  // ----- 측정 결과 (나중에 백엔드에서 받을 값) -----
  const [validReps, setValidReps] = useState(8);
  const [avgHold, setAvgHold] = useState(1.4);
  const [avgRest, setAvgRest] = useState(0.8);
  const [earlyActivation, setEarlyActivation] = useState(70);
  const [lateActivation, setLateActivation] = useState(45);

  // ----- 실시간 측정 화면 -----
  const [contraction, setContraction] = useState(true);
  const [holdSec, setHoldSec] = useState(1.2);
  const [restSec, setRestSec] = useState(1.5);

  const plan: Plan = {
    exercise: "biceps_curl",
    exerciseName: "팔꿈치 굽히기",
    muscleName: "상완이두근",
    targetReps, targetHold, allowIncrease, maxReps,
  };
  const result: SessionResult = {
    validReps,
    holds: makeHolds(validReps, avgHold),
    avgHold, avgRest, earlyActivation, lateActivation,
  };

  // ----- 내가 만든 함수로 계산 -----
  const items = sessionFeedback(result, plan);
  const next = nextSession(result, plan);
  const videos = recommendVideos(items, plan.exercise);
  const beforeVideos = preExerciseVideos(plan.exercise);
  const rate = completionRate(result, plan);
  const live = liveFeedback({ reps: validReps, contraction, holdSec, restSec }, plan);
  const change = earlyActivation > 0 ? Math.round(((lateActivation - earlyActivation) / earlyActivation) * 100) : 0;

  return (
    <div className="app">
      {/* ===== 상단 바 (데모와 같은 구조) ===== */}
      <header className="appbar">
        <p className="logo">Myo<span>Track</span></p>
        <nav className="tabs" aria-label="메뉴">
          <button className="tab" disabled title="다른 팀원 담당">홈</button>
          <button className="tab" aria-current={view !== "live" ? "page" : undefined} onClick={() => setView("before")}>운동</button>
          <button className="tab" aria-current={view === "live" ? "page" : undefined} onClick={() => setView("live")}>실시간 측정</button>
          <button className="tab" disabled title="다른 팀원 담당">기록</button>
          <button className="tab" disabled title="다른 팀원 담당">내 정보</button>
        </nav>
      </header>

      <main className="page">
        {/* =================== 운동 (시작 전) =================== */}
        {view === "before" && (
          <>
            <PageTitle title="운동 준비" sub={`${plan.exerciseName}, ${plan.muscleName}`} />

            <div className="metrics">
              <Metric label="목표 반복" value={`${targetReps}회`} />
              <Metric label="목표 수축시간" value={`${targetHold}초`} />
              <Metric
                label="목표 늘리기"
                value={allowIncrease ? "허용" : "유지"}
                note={allowIncrease ? `최대 ${maxReps}회까지` : "전문가와 상의 후 변경"}
              />
            </div>

            <section className="card">
              <h2 className="card-title">시작 전 영상</h2>
              <p className="card-text">측정 전에 몸을 풀고, 센서를 붙이는 위치를 확인하세요.</p>
              <VideoSet cards={beforeVideos} />
              <button className="btn" onClick={() => setView("live")}>측정 시작</button>
            </section>
          </>
        )}

        {/* =================== 실시간 측정 =================== */}
        {view === "live" && (
          <>
            <PageTitle title="실시간 측정" sub="근수축이 감지될 때마다 횟수가 올라갑니다." />

            <section className="card live">
              <p className="live-count">
                <b>{Math.min(validReps, targetReps)}</b>
                <span>/ {targetReps}회</span>
              </p>
              <h2 className="live-headline">{live.headline}</h2>
              <p className="live-sub">{live.sub}</p>

              <div className="holdbar" aria-label="이번 수축 유지 시간">
                <div
                  className="holdbar-fill"
                  style={{ width: `${Math.min(100, (holdSec / targetHold) * 100)}%` }}
                  data-active={contraction}
                />
              </div>
              <p className="holdbar-label">
                {contraction
                  ? holdSec >= targetHold
                    ? "목표 수축시간 도달"
                    : `목표까지 ${Math.round((targetHold - holdSec) * 10) / 10}초`
                  : `이완 중 ${restSec}초`}
              </p>

              <button className="btn" onClick={() => setView("result")}>측정 끝내고 결과 보기</button>
            </section>
          </>
        )}

        {/* =================== 운동 결과 =================== */}
        {view === "result" && (
          <>
            <PageTitle title="운동 결과" sub="이번 세션에서 측정된 수행 지표입니다." />

            {/* ----- 데모에 있던 지표 3개 + 추가 지표 2개 ----- */}
            <div className="metrics">
              <Metric label="운동 수행률" value={`${rate}%`} />
              <Metric label="유효 반복" value={`${validReps}회`} note={`목표 ${targetReps}회`} />
              <Metric label="평균 수축시간" value={`${avgHold.toFixed(1)}초`} note={`목표 ${targetHold}초`} />
              <Metric label="평균 이완시간" value={`${avgRest.toFixed(1)}초`} note={`권장 ${MIN_REST_SEC}초 이상`} />
              <Metric label="후반 활성도 변화" value={`${change > 0 ? "+" : ""}${change}%`} note="초반 대비" />
            </div>

            {/* ----- 반복별 수축시간 ----- */}
            <section className="card">
              <h2 className="card-title">반복별 수축시간</h2>
              <p className="card-text">막대 하나가 수축 한 번입니다. 점선이 목표 수축시간입니다.</p>
              <RepStrip holds={result.holds} targetReps={targetReps} targetHold={targetHold} />
            </section>

            {/* ----- 항목별 피드백 ----- */}
            <h2 className="section-title">항목별 피드백</h2>
            <ul className="fbs">
              {items.map((it) => (
                <FeedbackCard key={it.id} item={it} result={result} plan={plan} />
              ))}
            </ul>

            {/* ----- 다음 운동 추천 (데모의 카드 + 목표 + 영상) ----- */}
            <section className="card">
              <h2 className="card-title">다음 운동 추천</h2>
              <p className="card-text">{next.message}</p>

              <div className="goals">
                <div className="goal">
                  <span>다음 목표 반복</span>
                  <b>
                    {next.changed && next.reps !== targetReps && <s>{targetReps}</s>}
                    {next.reps}회
                  </b>
                </div>
                <div className="goal">
                  <span>다음 목표 수축시간</span>
                  <b>{next.hold}초</b>
                </div>
              </div>

              <VideoSet cards={videos} />

              <button className="btn" disabled title="기록 화면은 다른 팀원 담당">저장된 기록 확인</button>
            </section>
          </>
        )}

        <p className="disclaimer">
          이 화면은 근전도로 측정한 운동 수행 정보입니다. 의학적 진단이 아니며, 운동 계획 변경은 담당 전문가와 상의하세요.
        </p>

        {/* ===== 테스트용 입력 (개발할 때만) ===== */}
        <details className="dev">
          <summary>테스트 값 바꾸기</summary>

          <fieldset>
            <legend>운동 계획</legend>
            <NumberInput label="목표 횟수" value={targetReps} onChange={setTargetReps} />
            <NumberInput label="목표 유지시간(초)" value={targetHold} onChange={setTargetHold} step={0.1} />
            <CheckInput label="목표 늘리기 허용" checked={allowIncrease} onChange={setAllowIncrease} />
            <NumberInput label="최대 횟수" value={maxReps} onChange={setMaxReps} />
          </fieldset>

          <fieldset>
            <legend>측정 결과</legend>
            <NumberInput label="유효 횟수" value={validReps} onChange={setValidReps} />
            <NumberInput label="평균 유지시간(초)" value={avgHold} onChange={setAvgHold} step={0.1} />
            <NumberInput label="평균 이완시간(초)" value={avgRest} onChange={setAvgRest} step={0.1} />
            <NumberInput label="초반 활성도" value={earlyActivation} onChange={setEarlyActivation} />
            <NumberInput label="후반 활성도" value={lateActivation} onChange={setLateActivation} />
          </fieldset>

          <fieldset>
            <legend>실시간 측정 화면</legend>
            <CheckInput label="지금 수축 중" checked={contraction} onChange={setContraction} />
            <NumberInput label="이번 유지시간(초)" value={holdSec} onChange={setHoldSec} step={0.1} />
            <NumberInput label="직전 이완시간(초)" value={restSec} onChange={setRestSec} step={0.1} />
          </fieldset>
        </details>
      </main>
    </div>
  );
}

// =========================================================
// 화면 조각들
// =========================================================

function PageTitle(props: { title: string; sub: string }) {
  return (
    <div className="page-head">
      <h1>{props.title}</h1>
      <p>{props.sub}</p>
    </div>
  );
}

// ----- 지표 카드 (데모의 "운동 수행률 10%" 같은 카드) -----
function Metric(props: { label: string; value: string; note?: string }) {
  return (
    <div className="card metric">
      <p className="metric-label">{props.label}</p>
      <p className="metric-value">{props.value}</p>
      {props.note && <p className="metric-note">{props.note}</p>}
    </div>
  );
}

// ----- 반복마다 버틴 시간 막대 -----
function RepStrip(props: { holds: number[]; targetReps: number; targetHold: number }) {
  const slots = Math.max(props.targetReps, props.holds.length);
  const top = Math.max(props.targetHold * 1.6, ...props.holds, 0.1);
  const targetPos = (props.targetHold / top) * 100;

  return (
    <figure className="strip">
      <div className="strip-plot">
        <div className="strip-target" style={{ bottom: `${targetPos}%` }}>
          <span>목표 {props.targetHold}초</span>
        </div>
        {Array.from({ length: slots }, (_, i) => {
          const h = props.holds[i];
          return (
            <div key={i} className="strip-slot">
              {h !== undefined ? (
                <div
                  className="strip-bar"
                  data-short={h < props.targetHold}
                  style={{ height: `${(h / top) * 100}%` }}
                  title={`${i + 1}회째 ${h}초`}
                />
              ) : (
                <div className="strip-empty" title={`${i + 1}회째 기록 없음`} />
              )}
            </div>
          );
        })}
      </div>
      <div className="strip-axis">
        {Array.from({ length: slots }, (_, i) => <span key={i}>{i + 1}</span>)}
      </div>
    </figure>
  );
}

// ----- 피드백 카드: 작은 그래프 + 한 줄 요약 + 설명 -----
const STATE_WORD: Record<Tone, string> = { done: "목표 도달", check: "확인 필요", info: "참고" };

function FeedbackCard(props: { item: FeedbackItem; result: SessionResult; plan: Plan }) {
  const { item, result, plan } = props;
  return (
    <li className="card fbp" data-tone={item.tone}>
      <p className="fbp-head">
        <span>{item.topic}</span>
        <span className="fbp-state">{STATE_WORD[item.tone]}</span>
      </p>

      {item.id === "reps" && <RepsDots done={result.validReps} target={plan.targetReps} />}
      {item.id === "hold" && <HoldGauge value={result.avgHold} target={plan.targetHold} />}
      {item.id === "rest" && <RhythmLine hold={result.avgHold} rest={result.avgRest} />}
      {item.id === "flow" && <FlowBars early={result.earlyActivation} late={result.lateActivation} tone={item.tone} />}

      <h3 className="fbp-title">{item.title}</h3>
      <p className="fbp-detail">{item.detail}</p>
    </li>
  );
}

// 반복: 목표 횟수만큼 칸, 기록된 만큼 채움
function RepsDots(props: { done: number; target: number }) {
  const slots = Math.min(Math.max(props.target, props.done), 30);
  return (
    <div className="g-reps">
      <div className="g-reps-row" aria-label={`목표 ${props.target}회 중 ${props.done}회 기록`}>
        {Array.from({ length: slots }, (_, i) => (
          <span key={i} className="g-rep" data-on={i < props.done} />
        ))}
      </div>
      <p className="g-caption"><b>{props.done}회</b> 기록 / 목표 {props.target}회</p>
    </div>
  );
}

// 수축 유지: 게이지 + 목표선 + 모자란 만큼 빗금
function HoldGauge(props: { value: number; target: number }) {
  const max = Math.max(props.target * 1.5, props.value * 1.1);
  const v = (props.value / max) * 100;
  const t = (props.target / max) * 100;
  const ticks = Array.from({ length: Math.floor(max) + 1 }, (_, i) => i);
  return (
    <div className="g-hold">
      <div className="g-hold-track">
        <div className="g-hold-fill" style={{ width: `${v}%` }}>
          <span className="g-hold-value">{props.value}초</span>
        </div>
        {props.value < props.target && (
          <div className="g-hold-gap" style={{ left: `${v}%`, width: `${t - v}%` }} />
        )}
        <div className="g-hold-target" style={{ left: `${t}%` }}>
          <span>목표 {props.target}초</span>
        </div>
      </div>
      <div className="g-ticks">
        {ticks.map((n) => (
          <span key={n} style={{ left: `${(n / max) * 100}%` }}>{n}</span>
        ))}
      </div>
    </div>
  );
}

// 이완: 힘주기 블록과 쉬는 구간을 근전도 신호처럼
function RhythmLine(props: { hold: number; rest: number }) {
  const cycles = 4;
  const goodRest = Math.max(MIN_REST_SEC, props.rest);
  const rows = [
    { name: "오늘", rest: props.rest, mine: true },
    ...(props.rest < MIN_REST_SEC ? [{ name: `${MIN_REST_SEC}초 쉬면`, rest: goodRest, mine: false }] : []),
  ];
  const total = cycles * (props.hold + goodRest);
  return (
    <div className="g-rhythm">
      {rows.map((r) => (
        <div key={r.name} className="g-rhythm-row" data-mine={r.mine}>
          <span className="g-rhythm-name">{r.name}</span>
          <div className="g-rhythm-line">
            {Array.from({ length: cycles }, (_, i) => (
              <div key={i} className="g-cycle">
                <span className="g-on" style={{ width: `${(props.hold / total) * 100}%` }} />
                <span className="g-off" style={{ width: `${(r.rest / total) * 100}%` }} />
              </div>
            ))}
          </div>
        </div>
      ))}
      <p className="g-caption">
        <span className="g-key g-key-on" /> 힘주기 {props.hold}초
        <span className="g-key g-key-off" /> 쉬기 {props.rest}초
      </p>
    </div>
  );
}

// 세션 흐름: 초반 / 후반 막대
function FlowBars(props: { early: number; late: number; tone: Tone }) {
  const max = Math.max(props.early, props.late, 1);
  const change = props.early > 0 ? Math.round(((props.late - props.early) / props.early) * 100) : 0;
  return (
    <div className="g-flow">
      <div className="g-flow-row">
        <span>초반</span>
        <div className="g-flow-bar"><i style={{ width: `${(props.early / max) * 100}%` }} /></div>
        <b>{props.early}</b>
      </div>
      <div className="g-flow-row" data-tone={props.tone}>
        <span>후반</span>
        <div className="g-flow-bar"><i style={{ width: `${(props.late / max) * 100}%` }} /></div>
        <b>{props.late}</b>
      </div>
      <p className="g-caption">초반 대비 <b>{change > 0 ? "+" : ""}{change}%</b></p>
    </div>
  );
}

// ----- 영상 묶음: 선택한 영상은 크게 재생, 나머지는 목록 -----
function VideoSet({ cards }: { cards: VideoCard[] }) {
  const [current, setCurrent] = useState(0);
  if (cards.length === 0) return null;
  const idx = Math.min(current, cards.length - 1);
  const main = cards[idx];

  return (
    <div className="vset">
      <Player url={main.video.url} title={main.video.title} />
      <div className="vmain">
        <p className="vmain-title">{main.video.title}</p>
        <p className="vmeta">
          {[main.video.channel, main.video.minutes > 0 ? `${main.video.minutes}분` : ""].filter(Boolean).join(", ")}
        </p>
        <p className="vreason">{main.reason}</p>
        {main.level && <p className="vlevel"><b>{main.level}</b> {main.why}</p>}
      </div>

      {cards.length > 1 && (
        <ul className="vlist">
          {cards.map((c, i) => (
            <li key={c.video.url}>
              <button className="vitem" aria-current={i === idx} onClick={() => setCurrent(i)}>
                <Thumb url={c.video.url} />
                <span className="vitem-text">
                  <span className="vitem-title">{c.video.title}</span>
                  <span className="vitem-reason">{c.reason}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// 유튜브 영상을 화면 안에서 바로 재생
function Player(props: { url: string; title: string }) {
  const id = youtubeId(props.url);
  if (!id) {
    return (
      <div className="player player-empty">
        <span className="player-play" aria-hidden="true" />
        <p>{props.title}</p>
        <small>링크를 아직 넣지 않았어요</small>
      </div>
    );
  }
  return (
    <div className="player">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}`}
        title={props.title}
        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function Thumb({ url }: { url: string }) {
  const id = youtubeId(url);
  const [failed, setFailed] = useState(false);
  return id && !failed ? (
    <img className="thumb" src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`} alt="" onError={() => setFailed(true)} />
  ) : (
    <span className="thumb thumb-empty" aria-hidden="true" />
  );
}

// ----- 숫자 입력칸 하나 -----
function NumberInput(props: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  step?: number;
}) {
  // 칸에 보이는 글자는 따로 저장 (다 지워도 0으로 안 바뀌게)
  const [text, setText] = useState(String(props.value));
  return (
    <label className="field">
      <span>{props.label}</span>
      <input
        type="number"
        value={text}
        step={props.step ?? 1}
        onFocus={(e) => e.target.select()}
        onChange={(e) => {
          setText(e.target.value);
          if (e.target.value !== "") props.onChange(Number(e.target.value));
        }}
      />
    </label>
  );
}

// ----- 체크박스 하나 -----
function CheckInput(props: { label: string; checked: boolean; onChange: (b: boolean) => void }) {
  return (
    <label className="field field-check">
      <input type="checkbox" checked={props.checked} onChange={(e) => props.onChange(e.target.checked)} />
      <span>{props.label}</span>
    </label>
  );
}

// =========================================================
// 도우미 함수
// =========================================================

// 테스트용: 평균 유지시간으로 반복마다 버틴 시간을 그럴듯하게 만들어 줌
// (실제로는 분석 담당이 반복마다 측정값을 보내준다)
function makeHolds(count: number, avg: number): number[] {
  const wiggle = [0.3, -0.2, 0.1, -0.4, 0.2, 0, -0.1, 0.3, -0.3, 0.1];
  const n = Math.max(0, Math.floor(count));
  const raw = Array.from({ length: n }, (_, i) => wiggle[i % wiggle.length]);
  const mean = n ? raw.reduce((a, b) => a + b, 0) / n : 0;
  return raw.map((w) => Math.max(0.1, Math.round((avg + w - mean) * 10) / 10));
}

function youtubeId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/);
  return m ? m[1] : null;
}
