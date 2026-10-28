export default function WaveChart({ values }: { values: number[] }) {
  const w = 300;
  const h = 120;
  const points = values
    .map((v, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * w;
      const y = h - (v / 100) * h;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="140">
      <polyline fill="none" stroke="#1f7a4d" strokeWidth="2" points={points} />
    </svg>
  );
}