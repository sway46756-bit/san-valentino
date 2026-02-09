/**
 * Main Application Entry Point
 * Valentine's Day Edition
 */

import { Background } from "../components/Background.js";

export class App {
  constructor(CONFIG) {
    this.CONFIG = CONFIG;
    console.log("Valentine's App Initialized");
  }

  async init() {
    console.log("App.init starting");
    
    try {
        new Background("backgroundCanvas", null);
        this.initInteraction();
    } catch (e) {
        console.error("Failed to initialize background", e);
    }
  }

  initInteraction() {
    const startBtn = document.getElementById('start-btn');
    const introSection = document.getElementById('intro-section');
    const animationSection = document.getElementById('animation-section');
    const messageSection = document.getElementById('message-section');
    const typeWriterText = document.getElementById('typewriter-text');
    
    // Elements for animation
    const kittenLeft = document.getElementById('kitten-left');
    const kittenRight = document.getElementById('kitten-right');
    const heartTextContainer = document.getElementById('heart-text-container');
    const tiAmoText = document.getElementById('ti-amo-text');

    const message = "Amore starò sempre al tuo fianco,\nsei il mio tutto rendi tutto super bello ❤️\n\nBuon San Valentino! 🌹";
    
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            // Play audio
            const audio = new Audio('./src/assets/media/sound.mp3'); 
            audio.volume = 0.5;
            audio.play().catch(e => console.log("Audio play failed (interaction needed first?): ", e));

            // 1. Hide Intro
            introSection.style.opacity = '0';
            
            setTimeout(() => {
                introSection.classList.add('hidden');
                
                // 2. Show Animation Section
                animationSection.classList.remove('hidden');
                
                // 3. Reveal Kittens
                setTimeout(() => {
                    kittenLeft.classList.add('show');
                    kittenRight.classList.add('show');
                    
                    // 4. Start Heart Throwing Sequence
                    setTimeout(() => {
                        this.throwHearts(kittenLeft, kittenRight, heartTextContainer);
                        
                        // 5. Reveal "Te Amo" text after throwing
                        setTimeout(() => {
                            tiAmoText.classList.add('show');
                            
                            // 6. Wait and then transition to Message
                            setTimeout(() => {
                                // Fade out animation
                                animationSection.style.transition = 'opacity 1s ease';
                                animationSection.style.opacity = '0';
                                
                                setTimeout(() => {
                                    animationSection.classList.add('hidden');
                                    messageSection.classList.remove('hidden');
                                    
                                    setTimeout(() => {
                                        messageSection.style.opacity = '1';
                                        this.typeWriter(message, typeWriterText, 50);
                                    }, 100);
                                }, 1000);
                                
                            }, 4000); // Wait 4 seconds to enjoy the heart
                        }, 2000); // Duration of drawing
                    }, 500);
                }, 100);
            }, 1000);
        });
    }
  }

  throwHearts(source1, source2, container) {
    const totalSteps = 60; // Total hearts to form the shape
    let step = 0;
    const scale = 12; 
    
    // We want to fill the heart shape nicely
    // We'll calculate points along the parametric curve
    
    const interval = setInterval(() => {
        if (step >= totalSteps) {
            clearInterval(interval);
            return;
        }
        
        // Target calculation (Heart Shape)
        // t goes from 0 to 2PI
        const t = (step / totalSteps) * Math.PI * 2;
        
        // Parametric equations for heart
        // Inverting Y because canvas Y is down
        const targetX = scale * 16 * Math.pow(Math.sin(t), 3);
        const targetY = -scale * (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
        
        // Apply offset to move it up slightly (to vertically center visually)
        const offsetY = -20; 

        // Alternate source: Left kitten for left side of heart (x < 0), Right for right?
        // Or just alternate.
        const source = (step % 2 === 0) ? source1 : source2;
        
        this.emitHeartToTarget(source, container, targetX, targetY + offsetY);
        
        step++;
    }, 30);
  }

  emitHeartToTarget(sourceElement, container, targetX, targetY) {
    const heart = document.createElement('div');
    heart.textContent = '❤️';
    heart.className = 'heart-particle';
    
    // Start position: Get source element position relative to the container
    // Since container is centered 50%/50%, and kittens are at bottom left/right
    // We can approximate start positions relative to the center center point (0,0 of container)
    
    // Kitten Left is at roughly -300px (depends on screen), bottom.
    // Let's deduce start pos from direction.
    const isLeft = sourceElement.id === 'kitten-left';
    
    // Start X/Y relative to center of container
    const startX = isLeft ? -300 : 300; 
    const startY = 300; // From bottom
    
    heart.style.left = `calc(50% + ${startX}px)`;
    heart.style.top = `calc(40% + ${startY}px)`;
    
    heart.style.opacity = '1';
    heart.style.transform = 'scale(0.5)';
    heart.style.transition = 'all 0.8s cubic-bezier(0.25, 1, 0.5, 1)'; // Smooth easing
    
    container.appendChild(heart);
    
    // Animate to target
    requestAnimationFrame(() => {
        // Final position
        heart.style.left = `calc(50% + ${targetX}px)`;
        heart.style.top = `calc(40% + ${targetY}px)`;
        heart.style.transform = 'scale(1)';
    });
  }

  typeWriter(text, element, speed) {
    let i = 0;
    element.innerHTML = ""; // Clear existing
    
    function type() {
      if (i < text.length) {
        const char = text.charAt(i);
        // Handle newlines
        if (char === '\n') {
            element.innerHTML += '<br>';
        } else {
            element.innerHTML += char;
        }
        i++;
        const randomSpeed = speed + (Math.random() * 50 - 25); // Slight human variance
        setTimeout(type, randomSpeed);
      }
    }
    
    type();
  }
}
