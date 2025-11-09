# 🚀 Quick Start Guide - Creator of Worlds

## Run the Game

```bash
cd creator-of-worlds
npm run dev
```

The game will automatically open in your browser at `http://localhost:3000`

## 🎮 First Steps

1. **Move the Camera**
   - Right-click + drag to rotate around the world
   - Mouse wheel to zoom in/out
   - Middle-click + drag to pan

2. **Sculpt Terrain**
   - Select "Raise Terrain" (default tool)
   - Left-click and drag on the terrain to create mountains
   - Try "Lower Terrain" to create valleys

3. **Paint Biomes**
   - Select "Add Water" to paint blue water areas
   - Select "Plant Forest" for green forests
   - Experiment with Desert and Snow

4. **Adjust Brush**
   - Use the Size slider to make your brush bigger/smaller
   - Use the Strength slider for subtle or dramatic changes

5. **Weather Effects**
   - Click "Toggle Rain" to add rainfall
   - Click "Toggle Snow" for snowfall
   - Watch the particles fall!

6. **Reset World**
   - Click "Regenerate World" for a new random terrain
   - Click "Reset All" to start fresh

## 🎨 Creative Ideas

- **Mountain Range**: Use Raise tool with large brush, then Smooth for realistic peaks
- **Valley Lake**: Lower terrain in circular pattern, then paint with Water
- **Island**: Start flat, raise terrain in center, paint edges with water
- **Snow-capped Mountains**: Raise high terrain, paint tops with Snow
- **Forest Hills**: Raise gentle hills, paint with Forest biome

## ⌨️ Keyboard Shortcuts

- **Space**: Temporarily switch to Smooth tool
- **WASD**: Move camera position
- **R**: Reset camera to default view

## 🔍 Debug Console

Open browser console (F12) to access:
- `window.game` - Game engine instance
- `window.ui` - UI manager instance

## 📊 Performance

The FPS counter in the top-right shows performance:
- **Green (50-60 FPS)**: Excellent
- **Yellow (30-50 FPS)**: Good
- **Red (<30 FPS)**: Consider lowering browser resolution

## 🐛 Troubleshooting

**Game won't load?**
- Check browser console (F12) for errors
- Make sure you ran `npm install` first

**Low FPS?**
- Close other browser tabs
- Reduce browser window size
- Try a different browser (Chrome/Edge recommended)

**Terrain not responding?**
- Make sure you're left-clicking on the terrain
- Check that a tool is selected (should have colored button)

## 🎓 Tips & Tricks

1. **Smooth Gradual Changes**: Use low strength (0.1-0.3) for subtle effects
2. **Dramatic Landscapes**: Use high strength (1.5-2.0) for quick results  
3. **Blend Biomes**: Paint with different biomes on top of each other
4. **Layer Heights**: Raise terrain in multiple passes for variation
5. **Flatten Plateaus**: Use Flatten tool after raising terrain

Enjoy creating worlds! 🌍✨

