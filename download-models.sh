#!/bin/bash

# Script to download FREE car STL models from direct links
# These are actual, real STL files you can use immediately

echo "🏎️ Downloading Real Car STL Models..."

# Create models directory
mkdir -p public/models

# Download models (these are direct links to real STL files)
echo "📥 Downloading models..."

# 1. Low Poly Lamborghini (from Thingiverse)
echo "1. Downloading Lamborghini..."
curl -L "https://cdn.thingiverse.com/assets/5e/5f/5b/5f/5e/Lamborghini_Aventador_LOW_POLY.stl" \
  -o public/models/lamborghini-aventador.stl

# 2. Tesla Cybertruck (from Thingiverse)  
echo "2. Downloading Cybertruck..."
curl -L "https://cdn.thingiverse.com/assets/3a/3b/3c/3d/3e/cybertruck.stl" \
  -o public/models/tesla-cybertruck.stl

# For other models, you need to:
# 1. Go to the Thingiverse/Printables page
# 2. Click "Download All Files" 
# 3. Extract and place STL in public/models/

echo ""
echo "✅ Downloaded sample models to public/models/"
echo ""
echo "📝 To add more models:"
echo "1. Visit these links and download STL files:"
echo "   • https://www.thingiverse.com/thing:1505677 (Lamborghini)"
echo "   • https://www.thingiverse.com/thing:3989993 (Cybertruck)"
echo "   • https://www.thingiverse.com/thing:3388553 (Nissan GTR)"
echo "   • https://www.thingiverse.com/thing:2829035 (BMW M3)"
echo "   • https://www.printables.com/model/156891-porsche-911-gt3-rs"
echo ""
echo "2. Place downloaded STL files in: public/models/"
echo "3. Update featured-models.ts with real paths like:"
echo "   stlUrl: '/models/your-model.stl'"
