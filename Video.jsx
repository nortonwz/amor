// Video.jsx — "Nossa História" • Dia dos Namorados
// Cenas compostas sobre o engine animations.jsx (Stage/Sprite/Easing globais).

(function () {
  const W = 1080, H = 1920, DUR = 42;

  const CREAM = '#f6e8e2';
  const ROSE = '#e8a0a8';
  const RED = '#d44d5c';
  const WINE = '#160a0f';

  const SERIF = "'Cormorant Garamond', Georgia, serif";
  const SANS = "'Montserrat', system-ui, sans-serif";

  const fract = (x) => x - Math.floor(x);
  const rnd = (i, k) => fract(Math.sin(i * 127.1 + k * 311.7) * 43758.5453);

  // ── Coração SVG ────────────────────────────────────────────────
  function Heart({ size = 24, color = ROSE, style = {} }) {
    return (
      <svg width={size} height={size * 0.9} viewBox="0 0 32 29" style={style}>
        <path d="M16 29 C 8 22 0 16 0 8.5 C 0 3.8 3.8 0 8.5 0 C 11.5 0 14.3 1.6 16 4 C 17.7 1.6 20.5 0 23.5 0 C 28.2 0 32 3.8 32 8.5 C 32 16 24 22 16 29 Z" fill={color} />
      </svg>
    );
  }

  // ── Corações flutuando (determinístico) ────────────────────────
  function Hearts({ count = 12, baseOpacity = 0.4, t, seed = 0 }) {
    const items = [];
    for (let i = 0; i < count; i++) {
      const r1 = rnd(i + seed, 1), r2 = rnd(i + seed, 2), r3 = rnd(i + seed, 3), r4 = rnd(i + seed, 4);
      const speed = 50 + r1 * 70;
      const x = r2 * (W - 80) + 20 + Math.sin(t * (0.5 + r3 * 0.6) + i * 2.1) * 36;
      const y = H + 80 - ((t * speed + r4 * 2400) % (H + 240));
      const size = 14 + r3 * 42;
      const op = baseOpacity * (0.35 + r1 * 0.65);
      items.push(
        <div key={i} style={{
          position: 'absolute', left: x, top: y,
          opacity: op,
          filter: size < 24 ? 'blur(1.5px)' : 'none',
          transform: `rotate(${(r2 - 0.5) * 30}deg)`,
          willChange: 'transform, opacity',
        }}>
          <Heart size={size} color={r4 > 0.7 ? RED : ROSE} />
        </div>
      );
    }
    return <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>{items}</div>;
  }

  // ── Vinheta / textura constante ────────────────────────────────
  function Vignette() {
    return (
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 40,
        background: 'radial-gradient(ellipse 120% 90% at 50% 45%, transparent 55%, rgba(10,3,6,0.55) 100%)',
      }} />
    );
  }

  // ── Legenda das cenas ──────────────────────────────────────────
  function Caption({ text, localTime, sceneDur, bottom = 200, size = 66 }) {
    const { Easing, clamp } = window;
    const inT = Easing.easeOutCubic(clamp((localTime - 0.7) / 0.8, 0, 1));
    const outT = Easing.easeInCubic(clamp((localTime - (sceneDur - 0.8)) / 0.7, 0, 1));
    const opacity = inT * (1 - outT);
    return (
      <div style={{
        position: 'absolute', left: 60, right: 60, bottom,
        textAlign: 'center',
        fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600,
        fontSize: size, lineHeight: 1.15, color: CREAM,
        textShadow: '0 4px 28px rgba(0,0,0,0.65)',
        opacity, transform: `translateY(${(1 - inT) * 26}px)`,
        zIndex: 30, textWrap: 'pretty', willChange: 'transform, opacity',
      }}>
        {text}
      </div>
    );
  }

  // ── Foto em tela cheia com Ken Burns ───────────────────────────
  function FullPhoto({ src, caption, zoomFrom = 1.04, zoomTo = 1.16, origin = '50% 40%', pos = 'center' }) {
    const { useSprite, Easing, clamp } = window;
    const { localTime, duration, progress } = useSprite();
    const inT = Easing.easeOutCubic(clamp(localTime / 0.9, 0, 1));
    const outT = Easing.easeInCubic(clamp((localTime - (duration - 0.9)) / 0.9, 0, 1));
    const opacity = inT * (1 - outT);
    const scale = zoomFrom + (zoomTo - zoomFrom) * progress;
    return (
      <div style={{ position: 'absolute', inset: 0, opacity, background: WINE, willChange: 'opacity' }}>
        <img src={src} alt="" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: pos,
          transform: `scale(${scale})`, transformOrigin: origin,
          willChange: 'transform',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(12,4,7,0.8) 0%, rgba(12,4,7,0.35) 18%, transparent 42%)',
        }} />
        <Caption text={caption} localTime={localTime} sceneDur={duration} />
      </div>
    );
  }

  // ── Foto horizontal como "retrato revelado" (polaroid) ─────────
  function CardPhoto({ src, caption, tiltFrom = -3.2, tiltTo = -1.4 }) {
    const { useSprite, Easing, clamp } = window;
    const { localTime, duration, progress } = useSprite();
    const t = window.useTime();
    const inT = Easing.easeOutBack(clamp((localTime - 0.15) / 1.0, 0, 1));
    const fadeIn = Easing.easeOutCubic(clamp(localTime / 0.7, 0, 1));
    const outT = Easing.easeInCubic(clamp((localTime - (duration - 0.9)) / 0.9, 0, 1));
    const opacity = fadeIn * (1 - outT);
    const rot = tiltFrom + (tiltTo - tiltFrom) * progress;
    const scale = (0.82 + 0.18 * inT) * (1 + 0.03 * progress);
    const cardW = 920;
    return (
      <div style={{ position: 'absolute', inset: 0, opacity, willChange: 'opacity' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse 90% 60% at 50% 38%, #2b1119 0%, ${WINE} 70%)`,
        }} />
        <Hearts count={9} baseOpacity={0.22} t={t} seed={31} />
        <div style={{
          position: 'absolute', left: '50%', top: '44%',
          width: cardW,
          transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${scale})`,
          background: '#fdf9f4',
          padding: '30px 30px 110px 30px',
          boxShadow: '0 40px 90px rgba(0,0,0,0.55)',
          willChange: 'transform',
        }}>
          <img src={src} alt="" style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', display: 'block' }} />
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: 26, textAlign: 'center',
            fontFamily: SERIF, fontStyle: 'italic', fontSize: 44, fontWeight: 600, color: '#5d3a42',
          }}>
            ♥
          </div>
        </div>
        <Caption text={caption} localTime={localTime} sceneDur={duration} bottom={330} />
      </div>
    );
  }

  // ── Abertura ───────────────────────────────────────────────────
  function Intro() {
    const { useSprite, Easing, clamp } = window;
    const { localTime, duration } = useSprite();
    const t = window.useTime();
    const out = Easing.easeInCubic(clamp((localTime - (duration - 0.8)) / 0.8, 0, 1));
    const line = (start, dur = 0.9) => {
      const p = Easing.easeOutCubic(clamp((localTime - start) / dur, 0, 1));
      return { opacity: p * (1 - out), transform: `translateY(${(1 - p) * 30}px)` };
    };
    const heartPulse = 1 + Math.sin(t * 3.2) * 0.08;
    return (
      <div style={{ position: 'absolute', inset: 0 }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse 100% 70% at 50% 30%, #31141d 0%, ${WINE} 75%)`,
        }} />
        <Hearts count={16} baseOpacity={0.4} t={t} seed={7} />
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 44, padding: '0 90px', textAlign: 'center',
        }}>
          <div style={{ ...line(0.4), fontFamily: SANS, fontSize: 30, fontWeight: 600, letterSpacing: '0.42em', color: ROSE, textTransform: 'uppercase' }}>
            12 de junho
          </div>
          <div style={{ ...line(0.9), fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 158, lineHeight: 1.02, color: CREAM }}>
            Nossa<br />história
          </div>
          <div style={{ ...line(1.6), fontFamily: SANS, fontSize: 34, fontWeight: 400, lineHeight: 1.5, color: 'rgba(246,232,226,0.78)', maxWidth: 700 }}>
            feita de pequenos grandes momentos com você
          </div>
          <div style={{ ...line(2.2), transform: `${line(2.2).transform} scale(${heartPulse})` }}>
            <Heart size={56} color={RED} />
          </div>
        </div>
      </div>
    );
  }

  // ── Final ──────────────────────────────────────────────────────
  function Finale({ src }) {
    const { useSprite, Easing, clamp } = window;
    const { localTime, duration, progress } = useSprite();
    const t = window.useTime();
    const fadeIn = Easing.easeOutCubic(clamp(localTime / 1.0, 0, 1));
    const scale = 1.0 + 0.14 * progress;
    const dim = Easing.easeInOutSine(clamp((localTime - 1.6) / 1.6, 0, 1));
    const l1 = Easing.easeOutCubic(clamp((localTime - 2.4) / 1.0, 0, 1));
    const l2 = Easing.easeOutCubic(clamp((localTime - 3.6) / 1.0, 0, 1));
    const l3 = Easing.easeOutCubic(clamp((localTime - 4.6) / 1.0, 0, 1));
    const pulse = 1 + Math.sin(t * 3.4) * 0.1;
    return (
      <div style={{ position: 'absolute', inset: 0, opacity: fadeIn, background: WINE }}>
        <img src={src} alt="" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: '50% 28%',
          transform: `scale(${scale})`, transformOrigin: '50% 35%',
          willChange: 'transform',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(to top, rgba(16,5,9,${0.42 + 0.4 * dim}) 0%, rgba(16,5,9,${0.18 * dim}) 55%, rgba(16,5,9,${0.3 * dim}) 100%)`,
        }} />
        <Hearts count={14} baseOpacity={0.38 * dim} t={t} seed={55} />
        <div style={{
          position: 'absolute', left: 70, right: 70, bottom: 190,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36, textAlign: 'center',
        }}>
          <div style={{
            opacity: l1, transform: `translateY(${(1 - l1) * 24}px)`,
            fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 72, lineHeight: 1.18, color: CREAM,
            textShadow: '0 4px 30px rgba(0,0,0,0.7)', textWrap: 'pretty',
          }}>
            Te amo hoje,<br />amanhã e sempre.
          </div>
          <div style={{ opacity: l2, transform: `scale(${pulse})` }}>
            <Heart size={64} color={RED} />
          </div>
          <div style={{
            opacity: l3, transform: `translateY(${(1 - l3) * 18}px)`,
            fontFamily: SANS, fontSize: 30, fontWeight: 600, letterSpacing: '0.36em',
            color: ROSE, textTransform: 'uppercase',
          }}>
            Feliz dia dos namorados
          </div>
        </div>
      </div>
    );
  }

  // ── Filme ──────────────────────────────────────────────────────
  function Film() {
    const { Sprite } = window;
    const t = window.useTime();
    return (
      <div data-screen-label={`t=${Math.floor(t)}s`} style={{ position: 'absolute', inset: 0, background: WINE }}>
        <Sprite start={0} end={5.4}><Intro /></Sprite>

        <Sprite start={4.7} end={9.5}>
          <FullPhoto src="fotos/IMG_20251121_063104.jpg" caption="Do nascer do sol…"
            zoomFrom={1.18} zoomTo={1.02} origin="50% 30%" pos="50% 40%" />
        </Sprite>

        <Sprite start={9.1} end={13.9}>
          <CardPhoto src="fotos/IMG_20251121_205328.jpg" caption="…às noites que são só nossas" />
        </Sprite>

        <Sprite start={13.5} end={18.3}>
          <FullPhoto src="fotos/IMG_20251219_195005_1.jpg" caption="A doçura dos dias simples"
            zoomFrom={1.03} zoomTo={1.16} origin="50% 32%" pos="50% 30%" />
        </Sprite>

        <Sprite start={17.9} end={22.7}>
          <FullPhoto src="fotos/IMG_20251129_202202.jpg" caption="O brilho de cada comemoração"
            zoomFrom={1.15} zoomTo={1.02} origin="55% 45%" pos="50% 45%" />
        </Sprite>

        <Sprite start={22.3} end={27.1}>
          <CardPhoto src="fotos/IMG_20260321_215651.jpg" caption="Cada riso dividido com você" tiltFrom={2.8} tiltTo={1.2} />
        </Sprite>

        <Sprite start={26.7} end={31.5}>
          <FullPhoto src="fotos/IMG_20251224_214723.jpg" caption="Você, sempre você"
            zoomFrom={1.04} zoomTo={1.17} origin="45% 30%" pos="50% 30%" />
        </Sprite>

        <Sprite start={31.1} end={35.9}>
          <FullPhoto src="fotos/IMG_20250918_170600.jpg" caption="E os sonhos que realizamos juntos"
            zoomFrom={1.13} zoomTo={1.0} origin="50% 50%" pos="50% 55%" />
        </Sprite>

        <Sprite start={35.5} end={DUR}>
          <Finale src="fotos/IMG-20250916-WA0015.jpg" />
        </Sprite>

        <Vignette />
      </div>
    );
  }

  // ── Raiz: espera o engine carregar, pré-carrega fotos ──────────
  function LoveVideo() {
    const [ready, setReady] = React.useState(() => !!window.Stage);
    React.useEffect(() => {
      const photos = [
        'fotos/IMG_20251121_063104.jpg', 'fotos/IMG_20251121_205328.jpg',
        'fotos/IMG_20251219_195005_1.jpg', 'fotos/IMG_20251129_202202.jpg',
        'fotos/IMG_20260321_215651.jpg', 'fotos/IMG_20251224_214723.jpg',
        'fotos/IMG_20250918_170600.jpg', 'fotos/IMG-20250916-WA0015.jpg',
      ];
      photos.forEach((p) => { const im = new Image(); im.src = p; });
      if (ready) return;
      const iv = setInterval(() => {
        if (window.Stage) { setReady(true); clearInterval(iv); }
      }, 40);
      return () => clearInterval(iv);
    }, [ready]);
    if (!ready) return <div style={{ position: 'absolute', inset: 0, background: '#0a0a0a' }} />;
    const Stage = window.Stage;
    return (
      <Stage width={W} height={H} duration={DUR} background={WINE} persistKey="dia-dos-namorados">
        <Film />
      </Stage>
    );
  }

  window.LoveVideo = LoveVideo;
})();
