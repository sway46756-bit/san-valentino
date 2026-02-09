/**
 * Main Application Entry Point
 * Valentine's Day Edition
 */

import { Background } from "../components/Background.js";
import { TeAmoAnimation } from "../components/TeAmoAnimation.js";

export class App {
  constructor(CONFIG) {
    this.CONFIG = CONFIG;
    this.background = null;
    this.teAmoAnimation = null;
    console.log("Valentine's App Initialized");
  }

  async init() {
    console.log("App.init starting");
    
    try {
        this.background = new Background("backgroundCanvas", null);
        this.teAmoAnimation = new TeAmoAnimation('animation-canvas', 'kitten-left', 'kitten-right');
        this.teAmoAnimation.init();
        
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
                
                // 3. Reveal Kittens (Bears)
                setTimeout(() => {
                    kittenLeft.classList.add('show');
                    kittenRight.classList.add('show');
                    
                    // 4. Start Heart Throwing Sequence
                        // Start TeAmo Animation
                        setTimeout(() => {
                            this.teAmoAnimation.start(() => {
                            // Animation Complete Callback
                            console.log("Animation Complete");
                            
                            // Show Big Heart
                            const bigHeart = document.getElementById('big-heart');
                            if(bigHeart) bigHeart.classList.add('show');
                            
                            // Transition to Message
                            // Transition to Message
                             setTimeout(() => {
                                // Fade out animation layer
                                animationSection.style.transition = 'opacity 2s ease'; // Slower fade out
                                animationSection.style.opacity = '0';
                                
                                // Start fading in hearts concurrently
                                if(this.background) this.background.fadeInHearts(2500);

                                setTimeout(() => {
                                    this.teAmoAnimation.stop();
                                    animationSection.classList.add('hidden');
                                    messageSection.classList.remove('hidden');
                                    
                                    setTimeout(() => {
                                        messageSection.style.opacity = '1';
                                        this.typeWriter(message, typeWriterText, 50);
                                    }, 100);
                                }, 2000); // 2s matches transition time
                                
                            }, 4000); // Wait a bit to see the result
                        });
                        
                    }, 800);
                }, 100);
            }, 1000);
        });
    }
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
