/**
 * Background Component
 * Animated hearts background for Valentine's Day
 */

export class Background {
  static DEFAULT_PALETTE = [
    "255, 0, 85",    // Hot Pink
    "255, 77, 136",  // Lighter Pink
    "255, 153, 187", // Soft Pink
    "220, 20, 60",   // Crimson
    "148, 0, 211",   // Dark Violet accent
  ];

  static DEFAULT_SETTINGS = {
    starCount: 80, 
    starSize: { min: 8, max: 20 },
    moveSpeed: 0.5,
    pulsatingStars: {
      enabled: true,
      speed: 2.0,
      intensity: 0.15,
    },
    shootingStars: {
        enabled: false
    },
    mouseInteraction: {
      enabled: true,
      distance: 150,
    },
    animations: {
      pulseEffect: true,
      breathingEffect: true,
      twinkleStars: false,
    },
     colorMode: {
      backgroundIntensity: 0.2,
    }
  };

  static TWO_PI = Math.PI * 2;

  constructor(canvasId, palette, userSettings = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas)
      throw new Error(`Canvas with id '${canvasId}' not found.`);

    this.ctx = this.canvas.getContext("2d");

    this.settings = { ...Background.DEFAULT_SETTINGS, ...userSettings };
    this.rawPalette = palette || Background.DEFAULT_PALETTE;
    
    // Process colors
    this.colors = this.rawPalette.map(color => `rgba(${color}, 1)`);

    this.time = 0;
    this.mouse = { x: 0, y: 0, active: false };
    this.items = [];

    this._initialize();
  }

  _initialize() {
    this.handleResize = this._setupCanvas.bind(this);
    this._handleMouseMove = this._handleMouseMove.bind(this);
    this._handleMouseLeave = this._handleMouseLeave.bind(this);

    window.addEventListener("resize", this.handleResize);
    this.canvas.addEventListener("mousemove", this._handleMouseMove);
    this.canvas.addEventListener("mouseleave", this._handleMouseLeave);

    this._setupCanvas();
    this.animate();
  }

  _handleMouseMove(e) {
    this.mouse = { ...this.mouse, x: e.clientX, y: e.clientY, active: true };
  }

  _handleMouseLeave() {
    this.mouse.active = false;
  }

  _setupCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this._generateItems();
  }

  _generateItems() {
    this.items = Array.from({ length: this.settings.starCount }, () => {
        const size = this.settings.starSize.min + Math.random() * (this.settings.starSize.max - this.settings.starSize.min);
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height, // Start random height
            size: size,
            speed: (Math.random() * 0.5 + 0.5) * this.settings.moveSpeed,
            phase: Math.random() * Background.TWO_PI,
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            opacity: 0.4 + Math.random() * 0.6,
            wiggle: (Math.random() - 0.5) * 2
        };
    });
  }

  _drawHeart(x, y, size, color, opacity) {
    this.ctx.globalAlpha = opacity;
    this.ctx.fillStyle = color;
    
    this.ctx.save();
    this.ctx.translate(x, y);
    const pulse = 1 + Math.sin(this.time * this.settings.pulsatingStars.speed + x) * this.settings.pulsatingStars.intensity;
    this.ctx.scale(size * pulse * 0.1, size * pulse * 0.1); 

    this.ctx.beginPath();
    this.ctx.moveTo(0, -10);
    this.ctx.bezierCurveTo(-15, -20, -35, -10, -35, 10);
    this.ctx.bezierCurveTo(-35, 30, 0, 50, 0, 55); 
    this.ctx.bezierCurveTo(0, 50, 35, 30, 35, 10);
    this.ctx.bezierCurveTo(35, -10, 15, -20, 0, -10);
    
    this.ctx.fill();
    this.ctx.restore();
    this.ctx.globalAlpha = 1;
  }

  update() {
    this.time += 0.01;
    
    this.items.forEach(item => {
        // float upwards
        item.y -= item.speed;
        item.x += Math.sin(this.time + item.phase) * 0.3; // Gentle sway

        // Reset if off screen (top) 
        // We actually want them to go UP, so y decreases.
        if (item.y < -50) {
            item.y = this.canvas.height + 50;
            item.x = Math.random() * this.canvas.width;
        }
    });

    // Mouse drift
    if (this.mouse.active) {
        // Optional: attract or repel logic could go here
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Gradient Background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#1a000d');
    gradient.addColorStop(1, '#4d0026');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.items.forEach(item => {
        this._drawHeart(item.x, item.y, item.size, item.color, item.opacity);
    });
  }

  animate() {
    this.update();
    this.draw();
    requestAnimationFrame(this.animate.bind(this));
  }
}
