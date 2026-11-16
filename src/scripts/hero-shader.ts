// Hero-Hintergrund: orange-brauner Rauch wie auf der alten Seite, aber lebendig.
// Domain-Warping (Rauschen, das sich selbst verzerrt) ergibt weiche, langsam treibende Schwaden.
// Rendert in reduzierter Auflösung (der Rauch ist ohnehin weich), pausiert außerhalb des Viewports
// und bei verstecktem Tab.

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `
precision mediump float;
uniform vec2 r;
uniform float t;
uniform vec2 m;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
const mat2 R = mat2(0.8, 0.6, -0.6, 0.8);
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for(int i = 0; i < 4; i++){ v += a * noise(p); p = R * p * 2.03 + 3.1; a *= 0.5; }
  return v;
}
void main(){
  vec2 n = gl_FragCoord.xy / r;
  vec2 p = gl_FragCoord.xy / r.y * 1.35 + m * 0.06;
  float T = t * 0.035;

  vec2 q = vec2(fbm(p + vec2(0.0, T)), fbm(p + vec2(5.2, 1.3) - T * 0.8));
  vec2 s = vec2(fbm(p + 3.2 * q + vec2(1.7, 9.2) + T * 1.4),
                fbm(p + 3.2 * q + vec2(8.3, 2.8) - T * 1.1));
  float f = fbm(p + 2.8 * s);

  // Farben aus dem Hintergrundbild der alten Seite: fast Schwarz, Braun, Rostrot, Orange
  vec3 col = vec3(0.04, 0.024, 0.014);
  col = mix(col, vec3(0.24, 0.1, 0.03), smoothstep(0.2, 0.45, f));
  col = mix(col, vec3(0.72, 0.25, 0.04), clamp(smoothstep(0.34, 0.6, f) * (0.5 + 1.2 * q.y), 0.0, 1.0));
  col = mix(col, vec3(1.0, 0.48, 0.08), clamp(smoothstep(0.46, 0.72, f) * (1.7 * s.x - 0.05), 0.0, 1.0));
  col += vec3(1.0, 0.6, 0.25) * pow(clamp(smoothstep(0.6, 0.9, f) * s.y * 1.5, 0.0, 1.0), 2.0) * 0.4;

  // oben heller, unten dunkler wie im Original
  col *= 0.62 + 0.7 * smoothstep(0.0, 0.95, n.y);
  col += (hash(gl_FragCoord.xy + fract(t)) - 0.5) * 0.018; // gegen Farbstufen
  gl_FragColor = vec4(col, 1.0);
}`;

export function initHeroShader(canvas: HTMLCanvasElement, reduced: boolean): () => void {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) return () => {};

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return () => {};
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uR = gl.getUniformLocation(prog, 'r');
  const uT = gl.getUniformLocation(prog, 't');
  const uM = gl.getUniformLocation(prog, 'm');

  // Der Verlauf ist weich: reduzierte Auflösung reicht und spart GPU-Zeit.
  // Qualität passt sich an: Ist das Gerät zu langsam, sinkt erst die Auflösung, dann bleibt ein Standbild.
  let scale = window.innerWidth < 700 ? 0.3 : 0.35;
  let raf = 0;
  let last = 0;
  let slow = 0;
  let frames = 0;
  let frozen = false;
  let visible = true;
  let alive = true;
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  const start = performance.now();

  const resize = () => {
    const w = Math.max(2, Math.round(canvas.clientWidth * scale));
    const h = Math.max(2, Math.round(canvas.clientHeight * scale));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  };

  const draw = (now: number) => {
    mouse.x += (mouse.tx - mouse.x) * 0.04;
    mouse.y += (mouse.ty - mouse.y) * 0.04;
    gl.uniform2f(uR, canvas.width, canvas.height);
    gl.uniform1f(uT, reduced ? 12 : (now - start) / 1000 + 12);
    gl.uniform2f(uM, mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const loop = (now: number) => {
    raf = 0;
    if (!alive || frozen) return;
    const dt = now - last;
    // ~30 fps genügen für die langsame Bewegung
    if (dt >= 30) {
      if (last && dt < 400) {
        frames++;
        if (dt > 70) slow++;
        if (frames === 24) {
          if (slow > 8) {
            if (scale > 0.2) {
              scale = 0.18;
              resize();
            } else {
              frozen = true;
            }
          }
          frames = 0;
          slow = 0;
        }
      }
      last = now;
      draw(now);
    }
    if (visible && !document.hidden && !frozen) raf = requestAnimationFrame(loop);
  };
  const kick = () => {
    last = 0;
    if (!raf && alive && !reduced && !frozen && visible && !document.hidden) raf = requestAnimationFrame(loop);
  };

  const ro = new ResizeObserver(() => {
    resize();
    if (reduced) draw(performance.now());
  });
  ro.observe(canvas);
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    kick();
  });
  io.observe(canvas);
  const onMove = (e: PointerEvent) => {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ty = -((e.clientY / window.innerHeight) * 2 - 1);
  };
  window.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('visibilitychange', kick);

  resize();
  draw(performance.now());
  canvas.classList.add('is-on');
  kick();

  return () => {
    alive = false;
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    window.removeEventListener('pointermove', onMove);
    document.removeEventListener('visibilitychange', kick);
  };
}
