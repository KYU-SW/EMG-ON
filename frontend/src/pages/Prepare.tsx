import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";

export default function Prepare() {
  const [relaxDone, setRelaxDone] = useState(false);
  const [contractDone, setContractDone] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="page">
      <div className="page-title">
        <h2>측정 준비</h2>
        <span className="badge">팔 · 상완이두근</span>
      </div>

      <Card>
        <h3>① 센서 부착</h3>
        <div className="emoji">💪</div>
        <p>
          상완이두근의 지정된 측정 부위에 sEMG 전극을 부착합니다. EMG:ON 데모는
          팔 한 부위만을 대상으로 합니다.
        </p>
      </Card>

      <Card>
        <h3>② 개인별 기준값 설정</h3>
        <Card>
          <h3>이완 상태</h3>
          <p>편안하게 힘을 뺀 상태의 신호를 확인합니다.</p>
          <button className="btn ghost" onClick={() => setRelaxDone(true)}>
            {relaxDone ? "측정 완료 ✓" : "측정하기"}
          </button>
        </Card>
        <Card>
          <h3>기준 수축</h3>
          <p>안내에 따라 팔에 일정하게 힘을 주어 기준 신호를 설정합니다.</p>
          <button className="btn ghost" onClick={() => setContractDone(true)}>
            {contractDone ? "측정 완료 ✓" : "측정하기"}
          </button>
        </Card>
        <button
          className="btn"
          disabled={!(relaxDone && contractDone)}
          onClick={() => navigate("/live")}
        >
          설정 완료
        </button>
      </Card>
    </div>
  );
}