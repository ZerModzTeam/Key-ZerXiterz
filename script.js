const firebaseConfig = {
  apiKey: "AIzaSyAjDUzQMk7Vs23aXk3swyQaTD1ygx6b0dY",
  authDomain: "zerx-17d95.firebaseapp.com",
  databaseURL: "https://zerx-17d95-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "zerx-17d95",
  storageBucket: "zerx-17d95.firebasestorage.app",
  messagingSenderId: "374648942327",
  appId: "1:374648942327:web:d62d5c58b95ca5e29a6df2"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
let session = null;

// BINTANG GERAK
const cvs = document.getElementById('starCanvas'); const ctx = cvs.getContext('2d');
cvs.width = window.innerWidth; cvs.height = window.innerHeight;
let stars = []; for(let i=0; i<100; i++) stars.push({x:Math.random()*cvs.width, y:Math.random()*cvs.height, s:Math.random()*1.5});
function drawStars() {
    ctx.clearRect(0,0,cvs.width,cvs.height); ctx.fillStyle="#fff";
    stars.forEach(s => { ctx.beginPath(); ctx.arc(s.x, s.y, s.s, 0, 7); ctx.fill(); s.y+=0.5; if(s.y>cvs.height) s.y=0; });
    requestAnimationFrame(drawStars);
} drawStars();

function toggleKeyInput() {
    const type = document.getElementById('key_type').value;
    document.getElementById('custom_key_input').classList.toggle('hidden', type === 'random');
}

async function authLogin() {
    const u = document.getElementById('u_log').value;
    const p = document.getElementById('p_log').value;
    if(u === "acumalaka" && p === "gblk8989") { session = { user: u, role: "OWNER" }; start(); return; }
    db.ref('users/' + u).once('value', s => {
        if(s.exists() && s.val().pass === p) { session = s.val(); start(); } 
        else { alert("LOGIN GAGAL!"); }
    });
}

function start() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('home-screen').classList.remove('hidden');
    document.getElementById('welcome-msg').innerText = `Logged in as: ${session.user}`;
    if(session.role === "OWNER" || session.role === "ADMIN") 
        document.getElementById('admin-tools').classList.remove('hidden');
}

function show(id) {
    document.querySelectorAll('.box').forEach(b => b.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    if(id === 'list-scr') loadKeys();
}

function doGenerate() {
    let k;
    const type = document.getElementById('key_type').value;
    if(type === 'random') {
