// tuanzi.js — 团子大家族 · Claude家族篇（45s，配CLANNAD《だんご大家族》原曲29–74s）
// v3：+日文歌词轴 +历代版本注释 +云/树丰富背景 +团圆段烟花
(() => {
  const HEARTCOL = '#f2a0b5';

  // ---------- 日文歌词轴 ----------
  const LYRICS = [
    [1.5, 7.5,  'だんご だんご だんご 大家族'],
    [7.5, 13,   'やんちゃな焼きだんご'],
    [13, 18.5,  'ひとっ飛びだんご'],
    [18.5, 24,  'お芋だんご　ふわふわだんご'],
    [24, 29.5,  'すきやきだんご'],
    [29.5, 36,  'だんご だんご だんご 大家族'],
    [36, 41,    'だんご だんご 大家族～'],
    [41, 44.6,  'だんご 大家族'],
  ];
  function lyric(t) {
    for (const [a, b, txt] of LYRICS) {
      if (t >= a && t < b) {
        const pop = Math.min(1, (t - a) / .35);
        const alpha = Math.min(1, (b - t) / .4);
        const y = t >= 36 ? 235 : 1010;  // 团圆段歌词移到上方，避开舞群
        letter(txt, 960, y, 42, t >= 36 ? '#fff2d0' : '#7a5a48', { pop, alpha, screen: true });
        return;
      }
    }
  }
  // 版本注释（历代登场时，screen空间顶部）
  function version(txt, t, t0) {
    if (t < t0 || t > t0 + 3.4) return;
    const pop = Math.min(1, (t - t0) / .4);
    const alpha = Math.min(1, (t0 + 3.4 - t) / .5);
    letter(txt, 960, 130, 34, '#8a6a52', { pop, alpha, screen: true, rot: -.02 });
  }

  // ---------- 烟花 ----------
  function firework(t, t0, x0, hue) {
    const rise = seg(t, t0, t0 + .8);
    if (rise > 0 && rise < 1) {
      const p = arcPt([x0, 1060], [x0 + 50, 300], 140, rise);
      paint(ellPts(p[0], p[1], 5, 5, 8), { wash: '#f5d98a', ink: null, washOp: 220 });
      paint(ellPts(p[0], p[1] + 14, 3, 8 * (1 - rise), 8), { wash: '#f5d98a', ink: null, washOp: 120 });
    } else if (rise >= 1) {
      const bt = (t - t0 - .8) / 1.7;
      if (bt >= 0 && bt < 1) {
        const bx = x0 + 50, by = 300, r = 135 * easeOut(bt);
        const n = 12;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * TAU + t0;
          const px = bx + Math.cos(a) * r, py = by + Math.sin(a) * r * .72;
          paint(ellPts(px, py, 6.5 * (1 - bt * .7), 6.5 * (1 - bt * .7), 8), { wash: hue, ink: null, washOp: 245 * (1 - bt) });
        }
        glow(bx, by, 90 * (1 - bt), hue, .5 * (1 - bt));
      }
    }
  }

  // ---------- 公共布景 ----------
  // 夜色系数 nightK: 0=白纸暖光 1=薰衣草星夜
  function ground(t, nightK, camDx = 0, camDy = 0, camZ = 1) {
    camBegin(960 + camDx + 14 * Math.sin(t * .5), 540 + camDy, camZ + .015 * Math.sin(t * .7));
    const top = mixCol('#dcecf7', '#8f8ccd', nightK);
    const mid = mixCol('#FBF3E4', '#9b8ecf', nightK);
    const low = mixCol('#F6E7CE', '#cbb3e3', nightK);
    paint(rectPts(-300, -300, W + 600, 620), { wash: top, ink: null });
    paint(rectPts(-300, 300, W + 600, 340), { wash: mid, ink: null });
    paint(rectPts(-300, 620, W + 600, 600), { wash: low, ink: null });
    // 云（白天飘，夜里淡成云影）
    boilSeed('clouds');
    for (let i = 0; i < 3; i++) {
      const cx = ((hash(i * 7 + 1) * 2100 + t * (14 + i * 7)) % 2400) - 400;
      const cy = 150 + hash(i * 7 + 2) * 260, cs = .7 + hash(i * 7 + 3) * .7;
      paint(ellPts(cx, cy, 120 * cs, 40 * cs, 18), { wash: mixCol('#ffffff', '#7d74b8', nightK), ink: null, washOp: nightK > .5 ? 90 : 235 });
      paint(ellPts(cx + 55 * cs, cy - 22 * cs, 75 * cs, 34 * cs, 16), { wash: mixCol('#ffffff', '#7d74b8', nightK), ink: null, washOp: nightK > .5 ? 80 : 225 });
    }
    // 远山
    boilSeed('hills');
    paint(through([[ -200, 700], [300, 610], [750, 690], [1250, 600], [2100, 700], [2100, 1100], [-200, 1100]]),
      { fill: mixCol('#c9d8ea', '#6f6aa8', nightK), fillOp: 90, bleed: .18, tex: .5, ink: null, curv: .5 });
    // 远处小树（摇曳，夜里成剪影）
    boilSeed('trees');
    for (let i = 0; i < 4; i++) {
      const tx = 190 + hash(i * 5 + 1) * 1620, ty = 690 + hash(i * 5 + 2) * 40, ts = .55 + hash(i * 5 + 3) * .5;
      const sway = Math.sin(t * 1.1 + i * 2) * 3;
      inkLine([[tx, ty], [tx + sway, ty - 46 * ts]], 2.4, mixCol('#8a6a4a', '#3c3f6a', nightK), 'ink', 0);
      paint(ellPts(tx + sway, ty - 62 * ts, 30 * ts, 26 * ts, 14), { fill: mixCol('#a8c48a', '#454a80', nightK), fillOp: 200, bleed: .25, tex: .4, ink: null });
    }
    // 草地
    paint(ellPts(960, 1180, 1500, 330, 40, 2), { fill: mixCol('#dcecc8', '#5c6a9a', nightK), fillOp: 255, bleed: .2, tex: .4, ink: null });
    // 草丛（沸腾小笔触）
    boilSeed('grass');
    for (let i = 0; i < 9; i++) {
      const gx = 120 + hash(i) * 1750, gh = 16 + hash(i + 9) * 22;
      inkLine([[gx, 1090 + hash(i + 3) * 60], [gx + 8 * Math.sin(t * 1.4 + i), 1090 + hash(i + 3) * 60 - gh]], 1.4, mixCol('#8fae6a', '#4a5488', nightK), 'ink', .3);
    }
    // 星星（夜里浮现）
    if (nightK > .05) {
      boilSeed('stars');
      for (let i = 0; i < 26; i++) {
        const sx = hash(i * 3 + 1) * W, sy = hash(i * 3 + 2) * 560, tw = .5 + .5 * Math.sin(t * 2 + i * 1.7);
        paint(starPts(sx, sy, 3 + hash(i) * 4 * tw, .45, 4, i), { wash: mixCol('#f5e2a8', '#fff6d8', tw), ink: null, fillOp: nightK * (140 + 100 * tw) });
      }
    }
  }

  function endCam() { camEnd(); }

  // ---------- A 0–4.5 初代醒来 ----------
  function shotA(t, lt, dur) {
    ground(t, 0, 0, 0, 1 + .04 * lt);
    const mood = emotions(lt, [[0, 'sleepy'], [1.5, 'surprised'], [2.3, 'happy', { emote: '?' }]]);
    const stretch = spring(lt, 1.6, 3, 1);
    clawd(880, 880, 24, { ...mood, sx: 1 + .04 * Math.max(0, stretch), sq: .06 + mood.sq });
    endCam(); lyric(t);
    version('Claude 1 · はじまり', t, 2.2);
    if (lt < .7) { boilSeed('fadein'); paint(rectPts(-100, -100, W + 200, H + 200), { wash: PAL.paper, ink: null, washOp: 255 * (1 - easeIn(lt / .7)) }); }
    if (lt > dur - .35) brushWipe(.5 * seg(lt, dur - .35, dur + .3));
  }

  // ---------- B 4.5–11 写作（bowtie前辈） ----------
  function shotB(t, lt, dur) {
    ground(t, 0, 30, 0, 1.04);
    const m1 = emotions(lt, [[0, 'neutral'], [.5, 'happy'], [6.5, 'starstruck']]);
    if (lt > 1.2) {
      const st = stroll(lt, 1.2, 3.2, 300, 430, 20);
      clawd(st.x, 900, 20, { ...m1, ...st });
    } else {
      clawd(300, 900, 20, { ...m1, view: 'q' });
    }
    boilSeed('desk');
    const m2 = feel(lt < .8 ? 'happy' : 'determined', lt);
    clawd(1180, 920, 25, { ...m2, view: 'q', flip: true, hat: 'bowtie' });
    paint(rectPts(1250, 880, 190, 14, 2), { wash: '#b98d5e', ink: PAL.ink, sw: 1.2 });
    paint(rectPts(1272, 826, 150, 56, 1.5), { wash: PAL.cream, ink: PAL.ink, sw: 1 });
    boilSeed('inklines');
    const lines = clamp((lt - 1.2) / 5.5) * 9;
    for (let i = 0; i < 9; i++) {
      if (i < lines) {
        const ly = 838 + i * 5;
        inkLine([[1282, ly], [1282 + (30 + hash(i) * 90), ly + (hash(i + 5) - .5) * 4]], 1.6, PAL.ink, 'inkfine', .2);
      }
    }
    endCam(); lyric(t);
    version('Claude 2 · そさく', t, 1.2);
    if (lt < .5) brushWipe(.5 + .5 * ease(lt / .5));
    if (lt > dur - .4) brushWipe(.5 * seg(lt, dur - .4, dur + .35));
  }

  // ---------- C 11–17 DJ舞（headphones前辈） ----------
  function shotC(t, lt, dur) {
    ground(t, 0, -20, 0, 1.05);
    const style = ['sway', 'bounce', 'hop', 'wave'][Math.floor(lt / 1.6) % 4];
    const m3 = feel('cool', t);
    clawd(1080, 920, 25, { ...m3, hat: 'headphones', ...move(style, t, 3) });
    boilSeed('notes');
    for (let i = 0; i < 3; i++) {
      const nt = frac(lt * .5 + i / 3);
      const nx = 1230 + Math.sin(nt * TAU + i) * 40, ny = 640 - nt * 150;
      paint(ellPts(nx, ny, 9, 7, 12), { wash: PAL.ink, ink: null, washOp: 200 * (1 - nt) });
      inkLine([[nx + 8, ny], [nx + 8, ny - 30]], 2.2, PAL.ink, 'ink', 0);
    }
    const m1 = emotions(lt, [[0, 'happy'], [4, 'excited']]);
    const bob = Math.abs(Math.sin(bpOf(t) * Math.PI)) * 3;
    clawd(360, 920, 21, { ...m1, dy: -bob, rot: .06 * Math.sin(bpOf(t) * Math.PI) });
    endCam(); lyric(t);
    version('Claude 3 · おんがく', t, .8);
    if (lt > dur - .4) brushWipe(.5 * seg(lt, dur - .4, dur + .35));
  }

  // ---------- D 17–23 魔法（wizard前辈） ----------
  function shotD(t, lt, dur) {
    ground(t, .15, 0, 0, 1.06);
    const m35 = emotions(lt, [[0, 'determined'], [2.2, 'excited'], [4.3, 'proud']]);
    const armUp = kf(lt, [[0, -.3], [1.8, 1.5], [2.4, -.6], [3, .9], [3.6, -.3]]);
    glow(1180, 560, 120 + 60 * seg(lt, .5, 2.2) * (1 - seg(lt, 2.2, 2.6)), '#f5d98a', .5);
    clawd(1180, 920, 25, { ...m35, hat: 'wizard', aR: armUp, view: 'q', flip: true });
    if (lt > 2.4 && lt < 3.5) {
      const p = arcPt([1180, 620], [430, 700], 260, seg(lt, 2.4, 3.4));
      paint(starPts(p[0], p[1], 16, .45, 5, t * 3), { wash: '#f5d98a', ink: PAL.ink, sw: 1 });
      glow(p[0], p[1], 60, '#f5d98a', .5);
    }
    if (lt >= 3.5) paint(starPts(452, 762, 15, .45, 5, t * 2), { wash: '#f5d98a', ink: PAL.ink, sw: 1 });
    const st = stroll(lt, .8, 2.2, 280, 430, 20);
    const m1 = emotions(lt, [[0, 'excited'], [3.5, 'starstruck']]);
    clawd(st.x, 920, 21, { ...m1, ...st, view: 'q' });
    endCam(); lyric(t);
    version('Claude 3.5 · まほう', t, .8);
    if (lt < .45) brushWipe(.5 + .5 * ease(lt / .45));
    if (lt > dur - .4) brushWipe(.5 * seg(lt, dur - .4, dur + .35));
  }

  // ---------- E 23–29.5 大力（crown前辈） ----------
  function shotE(t, lt, dur) {
    ground(t, .1, 0, 0, 1.05);
    boilSeed('crates');
    paint(rectPts(1120, 830, 130, 96, 3), { wash: '#c99b64', ink: PAL.ink, sw: 1.2 });
    const box2y = kf(lt, [[1.2, 620], [2.6, 730], [2.75, 718], [3.1, 734], [3.4, 734]]);
    const wob = lt > 2.6 && lt < 3.2 ? .04 * Math.sin((lt - 2.6) * 30) * Math.exp(-(lt - 2.6) * 4) : 0;
    paint(rectPts(1136, box2y, 100, 92, 3), { wash: '#d8ab72', ink: PAL.ink, sw: 1.2 });
    if (lt > 3.2) glow(1186, box2y - 10, 50, '#f5d98a', .35);
    const m4 = emotions(lt, [[0, 'determined'], [3.2, 'proud']]);
    clawd(960, 930, 26, { ...m4, hat: 'crown', aL: kf(lt, [[0, .8], [1.2, 1.4], [2.8, .9], [3.4, -.6]]), aR: kf(lt, [[0, .8], [1.2, 1.4], [2.8, .9], [3.4, -.6]]), view: 'q', rot: wob });
    const m1 = emotions(lt, [[0, 'excited'], [3.4, 'laugh']]);
    const clap = lt > 3.4 ? Math.sin(t * TAU * 4) * .5 : 0;
    clawd(330, 930, 21, { ...m1, aL: .6 + clap, aR: .6 - clap, dy: m1.dy });
    endCam(); lyric(t);
    version('Claude 4 · ちから', t, .8);
    if (lt < .45) brushWipe(.5 + .5 * ease(lt / .45));
    if (lt > dur - .35) { boilSeed('irisout'); const at = toScreen(960, 800); iris(at[0], at[1], lerp(1400, 0, easeIn(seg(lt, dur - .35, dur + .3)))); }
  }

  // ---------- F 29.5–36 夜光守护（halo前辈） ----------
  function shotF(t, lt, dur) {
    const nightK = kf(lt, [[0, .25], [2, .9], [6.5, 1]]);
    ground(t, nightK, 0, 0, 1.04);
    boilSeed('moon');
    const my = kf(lt, [[.5, 380], [2.5, 200]]);
    paint(ellPts(1500, my, 62, 62, 30), { wash: '#f7ecc2', ink: null });
    glow(1500, my, 130, '#f7ecc2', .5 * nightK);
    const m45 = emotions(lt, [[0, 'neutral'], [1.8, 'proud']]);
    glow(1150, 700, 90 + 70 * seg(lt, 2, 3.4), '#ffe9a8', .55);
    clawd(1150, 930, 25, { ...m45, hat: 'halo', view: 'q', flip: true });
    const m1 = emotions(lt, [[0, 'sleepy'], [2.6, 'surprised'], [3.6, 'happy']]);
    clawd(430, 930, 21, { ...m1, view: 'q' });
    if (lt > 4) paint(heartPts(790, 700 + 12 * Math.sin(t * 2), 14, 0), { wash: HEARTCOL, ink: null, washOp: 220 });
    endCam(); lyric(t);
    version('Claude 4.5 · ねむりの守り', t, 1);
    if (lt < .4) flash(.5 * (1 - lt / .4), '#fff6d8');
    if (lt > dur - .4) brushWipe(.5 * seg(lt, dur - .4, dur + .35));
  }

  // ---------- G 36–45 大团圆围圈舞（party前辈C位+烟花） ----------
  function shotG(t, lt, dur) {
    const nightK = kf(lt, [[0, 1], [3, .85]]);
    ground(t, nightK, 0, 0, 1 + .05 * lt);
    // 烟花三连（团圆段40s起放一小会儿）
    firework(t, 40, 330, '#f5d98a');
    firework(t, 41.2, 780, '#f2a0b5');
    firework(t, 42.4, 1450, '#9fd8e8');
    // 5.5 从中央大跳登场
    const j = jump(lt, .2, 1.4, 5);
    glow(960, 700 - j.dy, 100 + 40 * Math.sin(t * 3), '#ffe9a8', .5);
    const m55 = emotions(lt, [[0, 'excited'], [2.6, 'love']]);
    clawd(960, 900, 28, { ...m55, hat: 'party', dy: j.dy, sq: j.sq });
    // 六位家族围圈共舞
    const R = 430, cy = 980;
    const fam = [
      { hat: 'bowtie', style: 'sway', u: 21 },
      { hat: 'headphones', style: 'bounce', u: 21 },
      { hat: 'wizard', style: 'spin', u: 21 },
      { hat: 'crown', style: 'roof', u: 21 },
      { hat: 'halo', style: 'wave', u: 21 },
      { hat: 'flower', style: 'hop', u: 21 },
    ];
    fam.forEach((f, i) => {
      const a = (i / 6) * TAU - Math.PI / 2 + .12 * Math.sin(t * .4 + i);
      const appear = clamp((lt - 1.6 - i * .25) / .5);
      if (appear > 0) {
        const fx = 960 + Math.cos(a) * R, fy = cy + Math.sin(a) * R * .42;
        dancer(fx, fy, f.u, f.style, t + i * .7, { seed: i * 7 });
        clawd(fx, fy, f.u, { ...feel('happy', t + i), hat: f.hat, ...move(f.style, t + i * .7, i * 7), boilKey: 'fam' + i });
      }
    });
    // 漂起的心
    boilSeed('hearts');
    for (let i = 0; i < 7; i++) {
      const ht = frac(lt * .3 + i / 7);
      paint(heartPts(200 + hash(i) * 1520, 900 - ht * 620, 10 + hash(i + 4) * 10, 0), { wash: HEARTCOL, ink: null, washOp: 190 * (1 - ht) });
    }
    endCam(); lyric(t);
    version('Claude Opus 5.5 · いま ここに', t, 1.6);
    if (lt > dur - .8) { const at = toScreen(960, 880); iris(at[0], at[1], lerp(1500, 0, easeIn(seg(lt, dur - .8, dur + .4)))); }
    if (lt < .5) brushWipe(.5 + .5 * ease(lt / .5));
  }

  shots([
    [0, shotA], [4.5, shotB], [11, shotC], [17, shotD], [23, shotE], [29.5, shotF], [36, shotG],
  ]);
})();
