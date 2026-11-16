// Eigener Hero-Visual: glühender, langsam fließender Ring-Körper in den Markenfarben.
// Rendert in reduzierter Auflösung, pausiert außerhalb des Viewports und bei verstecktem Tab.

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `
precision mediump float;
uniform vec2 r;
uniform float t;
uniform vec2 m;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for(int i = 0; i < 3; i++){ v += a * noise(p); p = p * 2.03 + 7.1; a *= 0.5; }
  return v;
}
vec3 ramp(float x){
  vec3 c0 = vec3(0.067);                // #111111
  vec3 c1 = vec3(0.45, 0.225, 0.0);     // #ff8000, abgedunkelt
  vec3 c2 = vec3(1.0, 0.502, 0.0);     // #ff8000
  vec3 c3 = vec3(1.0, 0.65, 0.3);      // #ff8000, aufgehellt
  vec3 c4 = vec3(1.0, 0.82, 0.62);
  vec3 c = mix(c0, c1, smoothstep(0.0, 0.3, x));
  c = mix(c, c2, smoothstep(0.25, 0.55, x));
  c = mix(c, c3, smoothstep(0.5, 0.8, x));
  return mix(c, c4, smoothstep(0.82, 1.0, x));
}
void main(){
  float asp = r.x / r.y;
  vec2 p = (gl_FragCoord.xy - 0.5 * r) / r.y;
  vec2 c = asp > 1.0 ? vec2(0.24 * asp, 0.06) : vec2(0.2, 0.3);
  c += m * 0.03;

  vec2 q = p - c;
  float w1 = fbm(q * 1.6 + vec2(t * 0.05, -t * 0.035));
  float w2 = fbm(q * 2.4 - vec2(t * 0.04, t * 0.06) + 4.0);
  q += 0.22 * vec2(w1 - 0.5, w2 - 0.5);

  float d = length(q);
  float body = smoothstep(0.78, 0.05, d);
  float rings = 0.5 + 0.5 * sin(d * 21.0 - t * 0.55 + w1 * 5.0);
  rings = smoothstep(0.25, 1.0, rings);
  float core = smoothstep(0.26, 0.0, d);

  float v = body * (0.42 + 0.4 * rings) + core * (asp > 1.0 ? 0.3 : 0.12);
  v += 0.1 * smoothstep(0.9, 0.2, d) * w2;
  v = clamp(v, 0.0, 1.0);

  vec3 col = ramp(v);
  col += (hash(gl_FragCoord.xy + t) - 0.5) * 0.035;
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
  let scale = window.innerWidth < 700 ? 0.4 : 0.5;
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
            if (scale > 0.25) {
              scale = 0.22;
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
