# Sketch-to-Render UI Overview

## 🎨 Updated Left Panel (Sketch Mode)

### When Sketch is NOT Saved (Drawing Phase)

```
┌─────────────────────────────────────┐
│  ← Back to Dashboard     Credits: 50│
├─────────────────────────────────────┤
│                                     │
│  ┌──────────┬──────────┐            │
│  │Text      │ SKETCH ✓ │            │
│  │Prompt    │          │            │
│  └──────────┴──────────┘            │
│                                     │
│  SKETCH YOUR DESIGN                 │
│  Use the canvas on the right →     │
│                                     │
│  Tool                               │
│  ┌────────┬──────────┐              │
│  │ 🖌 Pen │ 🧹 Eraser│              │
│  └────────┴──────────┘              │
│                                     │
│  Brush Size: 3px                    │
│  [-] ━━━●━━━━━━━━━━━ [+]           │
│                                     │
│  Color                              │
│  [████████] (color picker)          │
│                                     │
│  ┌────────┬───────┬────────┐        │
│  │↶ Undo │↷ Redo │🗑 Clear│        │
│  └────────┴───────┴────────┘        │
│                                     │
│  REFERENCE IMAGES (up to 3)         │
│  ┌────┐ ┌────┐ ┌────┐              │
│  │ 📷 │ │ 📷 │ │ 📷 │              │
│  └────┘ └────┘ └────┘              │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      💾 Save Sketch          │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### When Sketch IS Saved (Rendering Phase)

```
┌─────────────────────────────────────┐
│  ← Back to Dashboard     Credits: 50│
├─────────────────────────────────────┤
│                                     │
│  ┌──────────┬──────────┐            │
│  │Text      │ SKETCH ✓ │            │
│  │Prompt    │          │            │
│  └──────────┴──────────┘            │
│                                     │
│  SKETCH YOUR DESIGN                 │
│  ┌────────────────────────┐         │
│  │                        │         │
│  │    [Sketch Preview]    │         │
│  │                        │         │
│  └────────────────────────┘         │
│  [Clear & Redraw]                   │
│                                     │
│  RENDERING PROMPT                   │
│  ┌──────────────────────────────┐  │
│  │ sports car, metallic blue,   │  │
│  │ carbon fiber spoiler...      │  │
│  └──────────────────────────────┘  │
│  Describe the final render style   │
│                                     │
│  Drawing Influence: 70%             │
│  ━━━━━━━●━━━━━━━━━━━━━━━           │
│  More creative    Strict adherence │
│                                     │
│  Render Style                       │
│  ┌──────────────────────────────┐  │
│  │ Automotive Photography    ▼  │  │
│  └──────────────────────────────┘  │
│  Choose the final look and lighting│
│                                     │
│  REFERENCE IMAGES (up to 3)         │
│  ┌────┐ ┌────┐ ┌────┐              │
│  │ 📷 │ │ 📷 │ │ 📷 │              │
│  └────┘ └────┘ └────┘              │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  🎨 Render Sketch (5 credits)│   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

## 🖼️ Right Panel (Canvas Area)

### Drawing Phase

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│             DRAW YOUR DESIGN                         │
│    Use the tools on the left, then click            │
│           "Save Sketch" button                       │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │                                            │    │
│  │                                            │    │
│  │                                            │    │
│  │          [White Canvas - 1200x800]         │    │
│  │           User draws car sketch here       │    │
│  │                                            │    │
│  │                                            │    │
│  │                                            │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### After Rendering (Gallery View)

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │ 🖼️ Image                                    │    │
│  │ Sketch: sports car, metallic blue...       │    │
│  ├────────────────────────────────────────────┤    │
│  │                                            │    │
│  │    [Photorealistic Rendered Result]        │    │
│  │                                            │    │
│  ├────────────────────────────────────────────┤    │
│  │ [📥 Download] [🎨 Make 3D] [♻️ Iterate]    │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  [Previous renders appear below...]                 │
│                                                      │
└──────────────────────────────────────────────────────┘
```

## 🎯 Drawing Influence Slider Examples

### 0% - Creative Freedom
```
Your Sketch:    →    Result:
  ╭─╮                  Completely different car
  │ │                  AI ignores sketch shape
  ╰─╯                  Only uses prompt description
```

### 30% - Inspired By
```
Your Sketch:    →    Result:
  ╭───╮                Similar proportions
  │░░░│                But very different details
  ╰───╯                AI has lots of freedom
```

### 70% - Balanced (Default)
```
Your Sketch:    →    Result:
  ╭──┬──╮              Follows main shapes
  │▓▓│▓▓│              Adds realistic details
  ╰──┴──╯              Good balance of both
```

### 100% - Exact Match
```
Your Sketch:    →    Result:
  ╭────╮               Matches sketch precisely
  │████│               Only adds textures/lighting
  ╰────╯               Very faithful to drawing
```

## 🎨 Style Preset Examples

### Automotive Photography
- Studio HDRI lighting
- Showroom quality
- Dramatic reflections
- Professional composition

### V-Ray Render
- Physically accurate materials
- Global illumination
- Soft shadows
- Architectural quality

### KeyShot Render
- Product visualization
- Clean aesthetic
- Matte aluminum feel
- Corporate presentation

### Octane Render
- Path tracing
- Volumetric lighting
- Cinematic look
- High contrast

## 📝 Example Prompts

### Good Prompts (Specific)
✅ `sports car, metallic blue paint, carbon fiber hood, aggressive stance, 20 inch wheels`
✅ `luxury sedan, pearl white, chrome accents, elegant curves, showroom lighting`
✅ `concept SUV, matte black, LED light strips, futuristic design, studio background`

### Bad Prompts (Too Generic)
❌ `car` - Too vague
❌ `make it cool` - Not descriptive
❌ `add details` - What kind of details?

## 🔄 Iteration Workflow

1. **First Sketch** → Render at 70% → See result
2. **Adjust Influence**:
   - Too different? Increase to 85%
   - Too similar? Decrease to 50%
3. **Refine Prompt**: Add more specific details
4. **Try Different Style**: Test all 4 presets
5. **Update Sketch**: Fix proportions, redraw
6. **Render Again** → Compare results

## 🚀 Power User Tips

1. **Bold Lines** - Thicker brush (10-15px) = better edge detection
2. **Black Ink** - Use #000000 for strongest control
3. **Simple Shapes** - Don't over-detail, AI adds it
4. **Side View** - Easier than 3/4 for first attempt
5. **Reference Images** - Upload real cars for style guidance
6. **Low Influence First** - Start at 50%, increase if needed
7. **Batch Test Styles** - Same sketch, all 4 presets
8. **Save Winners** - Download best results for later iteration

## 💡 Creative Use Cases

### Design Exploration
- Sketch 5 variations → Render all → Pick best

### Client Presentations
- Hand sketch concept → Instant professional render

### Style Transfer
- Draw existing car → Apply new style preset

### Before/After
- Show sketch + final render side-by-side

### Rapid Prototyping
- Test design ideas in minutes, not hours

---

**Pro Tip**: Start with a **simple side-view sketch** at **70% influence** with **Automotive Photography** preset. This gives the best balance for first-time users.
