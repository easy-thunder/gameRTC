import Network from './network.js';
import Game from './game.js';
import Ball from './ball.js';
import Controls from './controls.js';
const socket = io();
const roomId = window.location.pathname.split('/')[1];
const network = new Network(roomId, socket);

const canvas = document.getElementById('gameCanvas');
canvas.width = 800;
canvas.height = 600;
const ball =  new Ball('warrior', Math.random() * (canvas.width - 20) + 10, canvas.height * 0.8);
const game = new Game(canvas, network, ball);




const controls = new Controls(canvas, ball);

game.start();