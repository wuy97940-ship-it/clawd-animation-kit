# 中文增强组件 API（叙事层）

> 上游引擎管"怎么画"，这些组件管"讲什么故事"。全部代码在 [`src/scenes/tuanzi.js`](../src/scenes/tuanzi.js)，可直接整段复制到你的场景文件。

## 1. 歌词轴 `LYRICS + lyric(t)`

歌词随唱段淡入淡出，支持日文/中文（走引擎手绘 lettering）。

```js
const LYRICS = [
  [1.5, 7.5,  'だんご だんご だんご 大家族'],   // [开始秒, 结束秒, 歌词]
  [7.5, 13,   'やんちゃな焼きだんご'],
  // ...
];

function lyric(t) {
  for (const [a, b, txt] of LYRICS) {
    if (t >= a && t < b) {
      const pop = Math.min(1, (t - a) / .35);            // 弹入
      const alpha = Math.min(1, (b - t) / .4);           // 淡出
      const y = t >= 36 ? 235 : 1010;                    // 特定段落换位（避开人群）
      letter(txt, 960, y, 42, t >= 36 ? '#fff2d0' : '#7a5a48', { pop, alpha, screen: true });
      return;
    }
  }
}
```

**用法**：在每个 shot 的 `endCam()` 之后调用 `lyric(t)`（letter 走 screen 空间，不受镜头影响）。

**踩坑提醒**：定义了不调用 = 歌词永远不出现。sheet 缩略图看不清歌词，验证必须用全尺寸 still：

```bash
node render.mjs --stills=15 --out=out/check
```

## 2. 版本注释 `version(txt, t, t0)`

角色登场时顶部弹出手绘小注（如 `Claude 3.5 · まほう`），3.4 秒后自动淡出。

```js
function version(txt, t, t0, x = 960, y = 152) {
  if (t < t0 || t > t0 + 3.4) return;
  const pop = Math.min(1, (t - t0) / .4);
  const alpha = Math.min(1, (t0 + 3.4 - t) / .5);
  letter(txt, x, y, 34, '#8a6a52', { pop, alpha, screen: true, rot: -.02 });
}
```

**用法**：在 shot 内 `version('Claude 2 · そさく', t, 1.2)` —— `t0` 是该 shot 内的登场时刻。

## 3. 烟花 `firework(t, t0, x0, hue)`

升空弧线（带尾迹）→ 放射绽放 12 瓣 → 光晕余晖，全程约 2.5 秒。

```js
firework(t, 40, 330, '#f5d98a');   // t=40s 起爆，x=330，金色
firework(t, 41.2, 780, '#f2a0b5'); // 粉色错峰
firework(t, 42.4, 1450, '#9fd8e8');// 青色
```

**卡点技巧**：把 `t0` 对准 BGM 副歌最高潮（先用 Python 对音轨做逐秒 RMS 能量分析定位）。

## 4. 场景丰富化 `ground(t, nightK, camDx, camDy, camZ)`

一体化背景层：天空渐变、飘云、远山、摇曳小树、草地、草丛、星月。

- `nightK`：0=白纸暖光 → 1=薰衣草星夜。用 `kf()` 随剧情插值即可实现昼夜流转
- 白天云自动飘动，入夜变淡紫云影；小树白天摇曳、入夜成剪影
- 每层都有独立 `boilSeed()`，水彩 fill 带晕染边缘

**性能**：无独立 GPU 时水彩 fill 约 0.5–2s/帧。提速方案：把 `fill` 水彩改为 `wash` 平涂（牺牲晕染质感）。

## 5. 完整案例

[`src/scenes/tuanzi.js`](../src/scenes/tuanzi.js) 是 45 秒成片的全部源码：七幕剧情（初代醒来 → 写作 → 打碟 → 魔法 → 大力 → 夜光守护 → 团圆烟花），六代 Clawd 用帽子装扮区分，每代一个技能秀。配合 [`STORYBOARD_TUANZI.md`](../STORYBOARD_TUANZI.md) 的分镜方法论（reads 时间轴）食用。

## 6. BGM 剪段方法论

1. 抽音轨：`ffmpeg -i 源视频.mp4 -vn -acodec pcm_s16le -ar 44100 bgm.wav`
2. 逐秒 RMS 能量分析（Python + numpy），找副歌高潮窗口
3. `ffmpeg -ss 起点 -t 45 -i bgm.wav ...` 剪出目标时长
4. 让画面高潮（团圆/绽放）对齐能量峰值
