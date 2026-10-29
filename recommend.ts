// =========================================================
// 피드백 + 영상 추천 모듈
// 담당: 3번 (피드백·영상 추천)
//
// 백엔드에서 받은 세션 결과(result) + 사용자가 입력한 계획(plan)을 보고
//   1) 운동 중 실시간 안내      → liveFeedback()
//   2) 세션 끝난 뒤 항목별 피드백 → sessionFeedback()
//   3) 다음 세션 안내            → nextSessionGuide()
//   4) 운동 후 추천 영상          → recommendVideos()
//   5) 운동 전 추천 영상          → preExerciseVideos()
// 를 만들어 준다.
//
// 원칙 (보고서 9장): 진단·판정 표현(정상/비정상, 좋음/나쁨, 피로, 근력 저하)은 쓰지 않고
// 측정된 사실 + 다음에 해볼 수 있는 행동만 말한다.
// =========================================================

// ---------------------------------------------------------
// 0. 데이터 모양 (백엔드 담당과 키 이름 맞춰야 함!)
// ---------------------------------------------------------
export type Plan = {
  exercise: string;       // 운동 코드 (영상 목록 찾을 때 씀)
  exerciseName: string;   // 화면에 보이는 운동 이름
  muscleName: string;     // 측정 근육 이름
  targetReps: number;     // 목표 반복 횟수
  targetHold: number;     // 목표 수축 유지시간(초)
  allowIncrease: boolean; // 목표를 늘려도 되는지 (전문가 지시대로 입력)
  maxReps: number;        // 늘려도 될 때 최대 몇 회까지
};

export type SessionResult = {
  validReps: number;       // 유효 반복 횟수
  holds: number[];         // 반복마다 수축 유지시간(초)
  avgHold: number;         // 평균 수축 유지시간(초)
  avgRest: number;         // 평균 이완시간(초)
  earlyActivation: number; // 세션 초반 평균 활성도
  lateActivation: number;  // 세션 후반 평균 활성도
};

// 피드백 한 줄의 종류: 목표 도달 / 확인해 볼 것 / 참고 정보
export type Tone = "done" | "check" | "info";

export type FeedbackItem = {
  id: string;
  tone: Tone;
  topic: string;    // 무엇에 대한 피드백인지 (반복, 수축 유지 ...)
  metric: string;   // 화면 왼쪽에 크게 보일 측정값 (예: 1.4초)
  metricLabel: string; // 측정값 이름 (예: 평균 유지)
  title: string;    // 한 줄 요약
  detail: string;   // 수치 + 이유 + 해볼 행동
  video?: VideoPick; // 연결된 추천 영상 (어느 자리, 어느 단계, 왜)
};

// 운동 후 영상 자리: 문제 종류별로 하나씩
export type Slot = "form" | "hold" | "rhythm" | "stretch";
// 단계: basic = 기본 (목표에 가까울 때), easy = 기초 (목표와 차이가 클 때)
export type Level = "basic" | "easy";
export const LEVEL_NAME: Record<Level, string> = { basic: "기본", easy: "기초" };

export type VideoPick = { slot: Slot; level: Level; why: string };

export type Video = { title: string; url: string; minutes: number; channel: string };

export type ExerciseVideos = {
  warmup: Video;                      // 운동 전: 준비운동
  sensor: Video;                      // 운동 전: 센서 붙이기
  slots: Record<Slot, Record<Level, Video>>; // 운동 후: 자리 4개 x 단계 2개
  cooldown: Video;                    // 운동 후: 다 잘했을 때 마무리
};

// ---------------------------------------------------------
// 1. 영상 목록
//    - 링크·제목·채널은 따옴표 안만 바꾸면 된다.
//    - minutes는 영상 보고 실제 길이(분)로 채우기. 0이면 화면에 안 보임.
//    - channel이 ""인 건 채널 이름을 아직 확인 못 한 영상. 직접 보고 채우기.
//    - 운동을 추가하려면 biceps_curl 덩어리를 통째로 복사해서 이름만 바꾸면 된다.
// ---------------------------------------------------------
const yt = (id: string) => `https://www.youtube.com/watch?v=${id}`;

export const VIDEOS: Record<string, ExerciseVideos> = {
  biceps_curl: {
    // ===== 운동 전 =====
    warmup: { title: "부상 막는 어깨 웜업 스트레칭",   url: yt("WGZd01qeviI"), minutes: 0, channel: "굿라이프" },
    sensor: { title: "아두이노 근전도 센서 사용해 보기", url: yt("2Bs195Hre5k"), minutes: 0, channel: "" }, // 채널 확인 필요

    // ===== 운동 후 =====
    slots: {
      // 수축이 적게 기록됐을 때
      form: {
        basic: { title: "덤벨 컬 바른 자세, 천천히 정확하게",  url: yt("F8RuUHwuYnI"), minutes: 0, channel: "필렁이 TV" },
        easy:  { title: "팔꿈치 굽힘·폄 운동 따라 하기",       url: yt("c7m7soqPE-c"), minutes: 0, channel: "새나래병원" },
      },
      // 버티는 시간이 짧을 때
      hold: {
        basic: { title: "다치지 않게 상완이두근 강화하는 법",   url: yt("TkIbm1bgjkU"), minutes: 0, channel: "굿라이프" },
        easy:  { title: "팔꿈치 굽힌 채로 버티기 (등척성 운동)", url: yt("2Zs9vIwyOgo"), minutes: 0, channel: "삼성서울병원" },
      },
      // 수축 사이 쉬는 시간이 짧을 때
      rhythm: {
        basic: { title: "근력 운동할 때 호흡하는 법",          url: yt("Pw2SB3yJIkA"), minutes: 0, channel: "키다리형" },
        easy:  { title: "힘주기와 힘빼기 연습 (점진적 근육 이완법)", url: yt("WNEFsdPxBZM"), minutes: 0, channel: "" }, // 채널 확인 필요
      },
      // 후반으로 갈수록 활성도가 낮아질 때
      stretch: {
        basic: { title: "놓치기 쉬운 상완이두근 스트레칭",      url: yt("7VwEdnkLwj4"), minutes: 0, channel: "홈닥's tube" },
        easy:  { title: "아주 쉬운 상완이두근 스트레칭",        url: yt("BiNGB3ACXJM"), minutes: 0, channel: "연세하나병원" },
      },
    },
    cooldown: { title: "운동 후 마무리 스트레칭",             url: yt("X8t6C07BJ80"), minutes: 0, channel: "" }, // 채널 확인 필요
  },
};

// ---------------------------------------------------------
// 2. 기준 숫자 (시험해 보면서 바꾸는 값)
// ---------------------------------------------------------
export const MIN_REST_SEC = 1.0;    // 이완 시간이 이것보다 짧으면 "이완 짧음"
const LOW_REPS_RATIO = 0.5;  // 유효 횟수가 목표의 50% 미만이면 "검출 적음"
const LATE_DROP_RATIO = 0.7; // 후반 활성도가 초반의 70% 미만이면 "후반 낮아짐"

// 단계 나누는 기준: 이것보다 더 부족하면 "기초" 영상
const EASY_REPS_RATIO = 0.25; // 유효 횟수가 목표의 25% 미만
const EASY_HOLD_RATIO = 0.7;  // 평균 유지가 목표의 70% 미만
const EASY_REST_SEC = 0.5;    // 평균 이완이 0.5초 미만
const EASY_LATE_RATIO = 0.5;  // 후반 활성도가 초반의 50% 미만

// 소수 한 자리로 보기 좋게
const sec = (n: number) => `${Math.round(n * 10) / 10}초`;
const pct = (r: number) => `${Math.round(r * 100)}%`;

// 영상 자리 + 단계 정하기 (easyIf가 true면 기초 영상)
const pick = (slot: Slot, easyIf: boolean, why: string): VideoPick => ({
  slot,
  level: easyIf ? "easy" : "basic",
  why,
});

// ---------------------------------------------------------
// 3. 운동 중 실시간 안내
// ---------------------------------------------------------
export type LiveState = {
  reps: number;         // 지금까지 유효 반복
  contraction: boolean; // 지금 수축 중인지
  holdSec: number;      // 이번 수축을 유지한 시간
  restSec: number;      // 직전 수축 후 이완한 시간
};

export function liveFeedback(s: LiveState, plan: Plan): { headline: string; sub: string } {
  const left = plan.targetReps - s.reps;

  if (left <= 0) {
    return { headline: "목표 횟수를 모두 채웠어요", sub: "천천히 힘을 빼고 마무리하세요." };
  }
  if (s.contraction && s.holdSec < plan.targetHold) {
    return { headline: "그대로 버티세요", sub: `${sec(s.holdSec)} / 목표 ${sec(plan.targetHold)}` };
  }
  if (s.contraction) {
    return { headline: "천천히 힘을 빼세요", sub: "목표 유지 시간을 채웠어요." };
  }
  if (s.restSec < MIN_REST_SEC) {
    return { headline: "잠깐 쉬었다 하세요", sub: "근육이 다 풀린 뒤 다음 동작을 시작하면 더 정확하게 세요." };
  }
  if (left === 1) {
    return { headline: "마지막 1회예요", sub: "힘을 주고 버텨 보세요." };
  }
  return { headline: "다음 동작을 시작하세요", sub: `목표까지 ${left}회 남았어요.` };
}

// ---------------------------------------------------------
// 4. 세션 끝난 뒤 항목별 피드백
// ---------------------------------------------------------
export function completionRate(result: SessionResult, plan: Plan): number {
  return Math.min(100, Math.round((result.validReps / plan.targetReps) * 100));
}

export function sessionFeedback(result: SessionResult, plan: Plan): FeedbackItem[] {
  const items: FeedbackItem[] = [];
  const { validReps, avgHold, avgRest, earlyActivation, lateActivation } = result;
  const { targetReps, targetHold } = plan;

  // ----- (1) 반복 횟수 -----
  if (validReps >= targetReps) {
    items.push({
      id: "reps", tone: "done", topic: "반복",
      metric: `${validReps}/${targetReps}회`, metricLabel: "유효 반복",
      title: "목표 횟수를 채웠어요",
      detail: `${targetReps}회 모두 기준을 넘는 수축으로 기록됐어요.`,
    });
  } else if (validReps < targetReps * LOW_REPS_RATIO) {
    items.push({
      id: "reps", tone: "check", topic: "반복",
      metric: `${validReps}/${targetReps}회`, metricLabel: "유효 반복",
      title: "기록된 수축이 적어요",
      detail: `목표 ${targetReps}회 중 ${validReps}회만 기준을 넘었어요. 센서가 근육 가운데에 붙어 있는지, 피부에 잘 밀착됐는지 먼저 확인해 보세요.`,
      video: pick("form", validReps / targetReps < EASY_REPS_RATIO, `목표의 ${pct(validReps / targetReps)}만 기록됐어요`),
    });
  } else {
    items.push({
      id: "reps", tone: "info", topic: "반복",
      metric: `${validReps}/${targetReps}회`, metricLabel: "유효 반복",
      title: `목표까지 ${targetReps - validReps}회 남았어요`,
      detail: `${targetReps}회 중 ${validReps}회가 기준을 넘는 수축으로 기록됐어요.`,
    });
  }

  // ----- (2) 수축 유지 -----
  const shortCount = result.holds.filter((h) => h < targetHold).length;
  if (avgHold >= targetHold) {
    items.push({
      id: "hold", tone: "done", topic: "수축 유지",
      metric: sec(avgHold), metricLabel: `평균 유지`,
      title: "유지 시간 목표에 닿았어요",
      detail: `평균 ${sec(avgHold)} 버텼어요. 목표는 ${sec(targetHold)}예요.`,
    });
  } else {
    items.push({
      id: "hold", tone: "check", topic: "수축 유지",
      metric: sec(avgHold), metricLabel: `평균 유지`,
      title: "버티는 시간이 목표보다 짧아요",
      detail: `평균 ${sec(avgHold)} 버텼고, 목표 ${sec(targetHold)}까지 ${sec(targetHold - avgHold)} 모자라요.` +
        (shortCount > 0 ? ` ${result.holds.length}회 중 ${shortCount}회가 목표보다 짧았어요.` : "") +
        " 힘을 준 채로 속으로 천천히 숫자를 세어 보세요.",
      video: pick("hold", avgHold / targetHold < EASY_HOLD_RATIO, `목표 유지 시간의 ${pct(avgHold / targetHold)}만큼 버텼어요`),
    });
  }

  // ----- (3) 이완 -----
  if (avgRest < MIN_REST_SEC) {
    items.push({
      id: "rest", tone: "check", topic: "이완",
      metric: sec(avgRest), metricLabel: "평균 이완",
      title: "쉬는 시간이 짧았어요",
      detail: `수축 사이에 평균 ${sec(avgRest)} 쉬었어요. 근육이 완전히 풀린 뒤 다음 동작을 시작하면 반복이 더 정확하게 기록돼요.`,
      video: pick("rhythm", avgRest < EASY_REST_SEC, `평균 ${sec(avgRest)} 쉬었어요`),
    });
  } else {
    items.push({
      id: "rest", tone: "done", topic: "이완",
      metric: sec(avgRest), metricLabel: "평균 이완",
      title: "수축 사이에 충분히 쉬었어요",
      detail: `수축 사이에 평균 ${sec(avgRest)} 쉬었어요.`,
    });
  }

  // ----- (4) 세션 흐름 (초반 vs 후반) -----
  const change = earlyActivation > 0 ? Math.round(((lateActivation - earlyActivation) / earlyActivation) * 100) : 0;
  if (lateActivation < earlyActivation * LATE_DROP_RATIO) {
    items.push({
      id: "flow", tone: "check", topic: "세션 흐름",
      metric: `${change > 0 ? "+" : ""}${change}%`, metricLabel: "후반 활성도",
      title: "후반으로 갈수록 활성도가 낮아졌어요",
      detail: `세션 후반 활성도가 초반보다 ${Math.abs(change)}% 낮았어요. 다음에는 반복 사이 휴식을 조금 더 길게 가져 보세요.`,
      video: pick("stretch", lateActivation / earlyActivation < EASY_LATE_RATIO, `후반 활성도가 초반의 ${pct(lateActivation / earlyActivation)}였어요`),
    });
  } else {
    items.push({
      id: "flow", tone: "info", topic: "세션 흐름",
      metric: `${change > 0 ? "+" : ""}${change}%`, metricLabel: "후반 활성도",
      title: "처음과 끝의 활성도가 비슷했어요",
      detail: `초반 대비 후반 활성도 변화는 ${change > 0 ? "+" : ""}${change}%였어요.`,
    });
  }

  return items;
}

// ---------------------------------------------------------
// 5. 다음 세션 안내 (계획 범위 안에서만 말한다)
// ---------------------------------------------------------
export type NextSession = {
  reps: number;     // 다음 목표 횟수
  hold: number;     // 다음 목표 유지시간(초)
  changed: boolean; // 오늘 계획과 달라졌는지
  message: string;  // 화면에 보여줄 안내 문장
};

export function nextSession(result: SessionResult, plan: Plan): NextSession {
  const { targetReps, targetHold, allowIncrease, maxReps } = plan;
  const metToday = result.validReps >= targetReps && result.avgHold >= targetHold;
  const same = { reps: targetReps, hold: targetHold, changed: false };

  if (!allowIncrease) {
    return { ...same, message: "지금 계획대로 이어가세요. 계획을 바꾸고 싶다면 담당 전문가와 상의하세요." };
  }
  if (metToday && targetReps >= maxReps) {
    return { ...same, message: `설정해 둔 최대 횟수(${maxReps}회)에 도달했어요. 이후 계획은 담당 전문가와 상의하세요.` };
  }
  if (metToday) {
    return {
      reps: targetReps + 1, hold: targetHold, changed: true,
      message: `오늘 목표를 모두 채웠어요. 한 번 더 늘려 볼 수 있어요. (설정한 최대 ${maxReps}회 이내)`,
    };
  }
  return { ...same, message: "오늘과 같은 목표로 한 번 더 해 보세요." };
}

// 예전 이름도 그대로 쓸 수 있게 남겨 둠
export function nextSessionGuide(result: SessionResult, plan: Plan): string {
  return nextSession(result, plan).message;
}

// ---------------------------------------------------------
// 6. 운동 후 추천 영상
//    1단계: 피드백에서 "확인해 볼 것"이 된 문제 → 영상 자리(slot) 정하기
//    2단계: 목표와 얼마나 차이 나는지 → 단계(기본/기초) 정하기
//    걸린 문제가 없으면 마무리 영상 하나.
// ---------------------------------------------------------
export type VideoCard = {
  video: Video;
  reason: string; // 왜 추천했는지 (피드백 제목)
  level?: string; // 기본 / 기초
  why?: string;   // 단계를 정한 근거 수치
};

export function recommendVideos(items: FeedbackItem[], exercise: string): VideoCard[] {
  const set = VIDEOS[exercise];
  if (!set) return [];

  const cards = items
    .filter((it) => it.video)
    .map((it) => {
      const p = it.video as VideoPick;
      return {
        video: set.slots[p.slot][p.level],
        reason: it.title,
        level: LEVEL_NAME[p.level],
        why: p.why,
      };
    });

  if (cards.length === 0) {
    return [{ video: set.cooldown, reason: "오늘 목표를 모두 채웠어요. 마무리로 근육을 풀어 주세요." }];
  }
  return cards;
}

// ---------------------------------------------------------
// 7. 운동 전 추천 영상 (측정 전이라 운동 종류로만 고른다)
// ---------------------------------------------------------
export function preExerciseVideos(exercise: string): VideoCard[] {
  const set = VIDEOS[exercise];
  if (!set) return [];
  return [
    { video: set.warmup, reason: "운동 전에 어깨와 팔을 먼저 풀어 주세요." },
    { video: set.sensor, reason: "센서를 붙이기 전에 한 번 보고 시작하세요." },
  ];
}
