import { useEffect, useState } from "react";
import Card from "../components/Card";
import WaveChart from "../components/WaveChart";
import { makeMockData } from "../mock/mockEmg";
import type { EmgLiveData } from "../types/emg";

export default function Live() {
  const [wave, setWave] = useState<number[]>(Array(60).fill(30));
  const [data, setData] = useState<EmgLiveData | null>(null);

  useEffect(() => {
    let reps = 0;
    const id = setInterval(() => {
      const d = makeMockData(reps, 10);
      if (d.contraction && reps < 10 && Math.random() > 0.6) reps += 1;
      setData({ ...d, reps, completionRate: Math.round((reps / 10) * 100) });
      setWave((prev) => [...prev.slice(1), d.activation]);
    }, 300);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="page">
      <div className="page-title">
        <h2>실시간 팔 운동 측정</h2>
        <span className="badge">신호 연결됨</span>
      </div>

      <Card>
        <h3>실시간 sEMG 신호</h3>
        <WaveChart values={wave} />
        <p>데모 파형입니다. 실제 구현에서는 Arduino에서 전달되는 sEMG 신호가 표시됩니다.</p>
      </Card>

      {data && (
        <Card>
          <div className="stat-label">수축 상태</div>
          <div className="stat-big">{data.contraction ? "수축 중" : "이완"}</div>
          <div className="stat-label" style={{ marginTop: 12 }}>반복</div>
          <div className="stat-big">{data.reps} / {data.targetReps}회</div>
          <p style={{ marginTop: 8 }}>{data.feedback}</p>
        </Card>
      )}
    </div>
  );
}