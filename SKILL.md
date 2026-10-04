---
name: clawd-animation
description: 用ClaudeAnimationBase引擎制作手绘水彩风角色动画MV（Clawd机器人主演）——分镜→逐镜绘制→关键帧自检→渲染混流一条龙。触发词：团子动画、Clawd动画、手绘MV、一句话做MV、vibe动画、Claude动画短片、p5.brush动画。
---

# Clawd 手绘动画制作（ClaudeAnimationBase 工作流）

为用户制作以 **Clawd**（Claude Code 吉祥物，陶土方块机器人）为主角的手绘水彩风动画短片，配乐成片输出 MP4。引擎改编自 John Heibel 的 [ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase)（MIT），本技能在其上加中文叙事层组件（歌词轴/版本注释/烟花）。

## 前置检查（先跑再动手）

1. 引擎工程位置（本机已克隆）：`D:\Claude\projects\douyin\团子大家族\claude_animation_base\`
   若不存在：`git clone https://github.com/JohnHeibel/ClaudeAnimationBase.git`（或用 clawd-animation-kit 仓库完整包）
2. `node --version` ≥ 18；Chrome 可用（默认路径自动探测，否则 `--chrome=` 指定）
3. `ffmpeg -version` 可用（渲染器编码要调它）
4. `npm install`（首次）

## 制作流程（七步，严格按序）

### 1. 需求三问（缺一不开工）
- **主题与主角**：讲什么故事？几代角色/几个场景？
- **BGM**：用户自备音频文件路径（**不要**替用户找版权音乐）；问清用什么段落
- **时长**：默认45秒（抖音竖屏可后期裁切，引擎原生1920×1080横屏）

### 2. 分镜先行（STORYBOARD.md，禁跳过）
按引擎规范写 `STORYBOARD.md`：Logline/World/Motif/情绪弧线/每镜头的 reads 时间轴。自检四条：每镜头有事件、转场全覆盖、无文字（用户点名的除外）、结尾呼应开头。**给用户看过分镜再写码。**

### 3. 配置与场景
- `src/config.js`：`PROJECT = { duration, bpm, offset }`（bpm对齐BGM实测节拍）
- 新建 `src/scenes/<名字>.js`：IIFE + `shots([[t, fn], ...])`；把 `studio.html` 的 demo.js script 标签换成你的文件
- 角色用 `clawd()`（31情绪 `feel()`、15帽子、`move()` 舞步、`turn()` 转身）；装扮区分角色版本
- 叙事层组件直接抄 `src/scenes/tuanzi.js`：`LYRICS+lyric(t)` 歌词轴、`version()` 版本注、`firework()` 烟花、`ground()` 云树星月背景
- 每帧必须是时间的纯函数（禁 Math.random/状态累积）；每层元素 `boilSeed()`；用户没点名要文字就**不写文字**（用 emotes）

### 4. 关键帧自检（省渲染时间的关键）
```bash
node render.mjs --sheet=关键帧时刻,逗号分隔 --cols=4 --w=420 --out=out/check/sheet.jpg
```
用 Read 工具看图检查：事件清晰/角色够大/转场在/无穿模。**验证文字类细节（歌词/注释）必须 `--stills=` 全尺寸再裁条看**——缩略图看不清小字。

### 5. 全片渲染（后台跑）
```bash
node render.mjs --clip --audio="BGM路径" --out="out/成片名.mp4"
```
1080帧约10-20分钟，**必须 run_in_background**。输出日志乱码是控制台编码显示问题，验证文件本身：Python 读 `moov` 盒确认完整。

### 6. 成片抽帧终检
ffmpeg 按 `-ss` 时间点抽 4-6 帧（开场/中段高潮/结尾），PIL 拼图后 Read 目检。

### 7. 交付与存档
- 成片路径报给用户，**发布永远是外向动作，必须用户明确授权**
- 中间产物（check/frames）清理，保留场景源码与成片

## 高频坑（前人踩过）

| 坑 | 解法 |
|----|------|
| 歌词/文字组件写了没调用 | sheet 缩略图看不出来，必须全尺寸 still 验证 |
| 泡泡/字幕只进不出叠层 | 每个文字元素都要有退出时间轴 |
| 开场角色忘退场与后续角色重叠 | 新角色登场前旧角色要有 leave 动画 |
| 水彩渲染慢（无GPU 0.5-2s/帧） | 让 Claude 把 `fill` 水彩改平涂 `wash`；或接受15分钟后台渲染 |
| `--encode` 报 ffmpeg 不存在 | ffmpeg 加入 PATH（Windows 可复制 ffmpeg.exe 到 PATH 目录） |
| 输出日志中文乱码 | 控制台显示问题，验证文件本体即可 |
| 长名牌折行/文字出框 | whiteSpace nowrap + 缩字号；letter() 有 screen 空间模式 |

## 素材与案例

- 完整中文教程与案例仓库：见 `docs/components.md` 与 `src/scenes/tuanzi.js`（七幕团子大家族全源码）
- 情绪/帽子/视角模型表：`docs/emotions.jpg`、`docs/views.jpg`
- BGM 剪段技巧：先用 Python 逐秒 RMS 能量分析找副歌高潮，让音乐情绪对齐画面高潮
