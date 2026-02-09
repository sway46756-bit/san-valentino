/**
 * Main Application Entry Point
 * Valentine's Day Edition
 */

import { App } from './core/App.js';

async function loadPage() {
  console.log("Starting Valentine's App...");
  
  try {
    const config = {}; 
    const app = new App(config);
    await app.init();

  } catch (error) {
    console.error("Critical Error:", error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadPage);
} else {
  loadPage();
}