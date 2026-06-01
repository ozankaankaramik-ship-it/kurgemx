'use client'

const PIECES = [
  { left: '5%',  color: '#2E75B6', delay: 0,    dur: 1.8 },
  { left: '15%', color: '#1F3864', delay: 0.2,  dur: 2.1 },
  { left: '25%', color: '#7EB3E8', delay: 0.05, dur: 1.6 },
  { left: '35%', color: '#2E75B6', delay: 0.4,  dur: 2.3 },
  { left: '45%', color: '#1F3864', delay: 0.15, dur: 1.9 },
  { left: '55%', color: '#7EB3E8', delay: 0.35, dur: 2.0 },
  { left: '65%', color: '#2E75B6', delay: 0.1,  dur: 1.7 },
  { left: '75%', color: '#1F3864', delay: 0.5,  dur: 2.2 },
  { left: '85%', color: '#7EB3E8', delay: 0.25, dur: 1.5 },
  { left: '92%', color: '#2E75B6', delay: 0.45, dur: 2.0 },
]

export default function ConfettiRain() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(100vh) rotate(540deg); opacity: 0; }
        }
      `}</style>
      {PIECES.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: 0,
            left: p.left,
            width: 9,
            height: 9,
            borderRadius: 2,
            background: p.color,
            animation: `confetti-fall ${p.dur}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  )
}
