# 🔥 Zanka no Tachi

Bringing one of the most iconic anime moments to life using Three.js, GPGPU techniques, and Blender.

As a long-time fan of Bleach, I’ve always admired Yamamoto Genryūsai's character. His Bankai, Zanka no Tachi (Blade of ember), is a masterclass in raw power, control, and sheer intimidation, and it has been a scene that stuck with me since I first watched it. Inspired by his line, "I am here, there is no greater security than that", I decided to attempt a very simplified recreation of his Bankai scene, focusing on the fire, its transformation, and its environment. This project combines my passion for Bleach with my desire to learn and experiment with advanced Three.js techniques.

<br />
<br />
<br />

## 🌅 Preview

[![Preview Image](/public/docs-preview.png)](https://alezen9.github.io/zanka-no-tachi/)
Click the image above to view the live experience directly!

<br />
<br />
<br />

## 🚀 The Journey

### The Fire

The fire was the heart of this project and undoubtedly the biggest challenge. I aimed to create dynamic, stylized fire that complemented the low-poly environment, focusing on visually compelling particle systems and GPGPU techniques.

- **Early Attempts:** <br />
  I initially explored Drei's FBO hooks for GPGPU but eventually fell back to a native Three.js solution that I had previously learned about in the [Three.js Journey](https://threejs-journey.com/) course. Adapting this approach to React, I built my own custom hook to handle GPGPU logic effectively.

- **GPGPU Hook:** <br />
  After many iterations, I developed a solid GPGPU hook to simulate fire behavior efficiently. I experimented with different variations of particle count and particle size. While the system seemed capable of handling a huge number of particles with ease, I ultimately opted for fewer but larger particles. This approach not only looked visually appealing but also blended well with the stylized aesthetic of the scene.

- **Particle Placement:** <br />
  Initially, my method for placing particles was functional but hard to tweak. Revisiting this led me to discover CatmullRomCurve3, a gem in the Three.js library for creating splines. With this, I could elegantly define the particle paths around Yamamoto, simplifying the process and achieving a more natural look.

- **Color Gradient:** <br />
  Getting the right gradient—bright cores transitioning to a red-orange decay—was another learning experience. Experimenting with various blending methods and color schemes eventually paid off.

<br />
<br />
<br />

### The Environment

To complement the fire, I modeled key elements in Blender, improving my 3D modeling skills along the way.

- **Character Pieces:** <br />
  Modeling Yamamoto’s character was a rewarding challenge. Low-poly design kept it efficient, but areas like the cloak (around the shoulders and arms) and feet tested my skills.

- **Battlefield:** <br />
  The ground plane and rocks helped create the impression of destruction. While simple, they were effective in conveying the scene's aftermath.

- **Lighting:** <br />
  Balancing performance and aesthetic appeal was critical. I experimented with lighting setups to ensure a visually compelling yet performant scene.

<br />
<br />
<br />

### The Animation

Animating the scene required careful attention to detail:

- **Fire Dynamics:** <br />
  Using noise for organic randomness, the flames were brought to life with animations for expansion and convergence, reflecting the Bankai's activation.

- **Blade Fire & Smoke:** <br />
  During the Shikai phase, I added fire to the blade, while the Bankai phase introduced smoke emanating from the sword. Both were implemented using particle-based shader systems. Creating the smoke effect required additional work to achieve the specific squishing effect I wanted.

- **Heat Haze:** <br />
  For the Bankai phase, I explored post-processing techniques to create a heat haze effect, diving deeper into post-processing pipelines and shaders.

- **Transitions:** <br />
  With GSAP, I smoothed transitions between phases, handled particle appearance/disappearance, and ensured unused particles were properly cleaned up.

- **Sound Design:** <br />
  To enhance immersion, I incorporated sound effects, including Yamamoto's Bankai declaration and burning fire, edited with tools like DaVinci Resolve.

<br />
<br />
<br />

## 📚 Learnings & Reflections

This project pushed my limits and taught me so much, from Three.js advanced techniques like GPGPU and splines to Blender modeling and post-processing pipelines. It was an incredible journey of experimentation, problem-solving, and growth.

### Key Takeaways:

- Fire simulation, even stylized, can be incredibly rewarding when it comes together.
- Tools like CatmullRomCurve3 and GSAP are invaluable for creating visually appealing and smooth interactions.
- Effective sound design can significantly enhance immersion.
- Every obstacle is an opportunity to learn, and the satisfaction of seeing an idea come to life is unparalleled.

<br />
<br />
<br />

## ✨ Final Result

The final scene looks great, runs smoothly, and meets my initial vision. It’s far from perfect, but I’m proud of what I’ve achieved and excited for what’s next. There’s still a long way to go, but being on this journey already brings me joy.
