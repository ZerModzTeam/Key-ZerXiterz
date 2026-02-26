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

async function authLogin() {
    const u = document.getElementById('u_log').value;
    const p = document.getElementById('p_log').value;
    if(u === "acumalaka" && p === "gblk8989") {
        session = { user: u, role: "OWNER" }; start(); return;
    }
    db.ref('users/' + u).once('value', s => {
        if(s.exists() && s.val().pass === p) {
            session = s.val(); start();
        } else { alert("LOGIN GAGAL!"); }
    });
}

function start() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('home-screen').classList.remove('hidden');
    document.getElementById('welcome-msg').innerText = `User: ${session.user} (${session.role})`;
    if(session.role === "OWNER" || session.role === "ADMIN") 
        document.getElementById('admin-tools').classList.remove('hidden');
}

function show(id) {
    document.querySelectorAll('.box').forEach(b => b.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    if(id === 'list-scr') loadKeys();
}

function doGenerate() {
    const k = "ZERX-" + Math.random().toString(36).substr(2,6).toUpperCase();
    const d = document.getElementById('d_sel').value;
    db.ref('license/' + k).set({
        game: document.getElementById('g_sel').value,
        expiry: Date.now() + (d * 86400000), device: ""
    }).then(() => alert("KEY BERHASIL: " + k));
}

function loadKeys() {
    db.ref('license').on('value', s => {
        let h = "";
        s.forEach(k => {
            const v = k.val();
            h += `<div style="border-bottom:1px solid #333; padding:5px;">
                <b>${k.key}</b> [${v.game}] 
                <button onclick="db.ref('license/${k.key}').remove()" style="background:red; width:40px; float:right;">DEL</button>
            </div>`;
        });
        document.getElementById('key-list').innerHTML = h || "Kosong.";
    });
}

function addUser() {
    const u = document.getElementById('new_u').value;
    db.ref('users/' + u).set({
        user: u, pass: document.getElementById('new_p').value,
        role: document.getElementById('new_r').value, expiry: "PERMANENT"
    }).then(() => { alert("USER BERHASIL!"); show('home-screen'); });
}

// Efek Bintang
const cvs = document.getElementById('starCanvas'); const ctx = cvs.getContext('2d');
cvs.width = window.innerWidth; cvs.height = window.innerHeight;
let stars = []; for(let i=0; i<100; i++) stars.push({x:Math.random()*cvs.width, y:Math.random()*cvs.height, s:Math.random()*1.5});
function draw() {
    ctx.clearRect(0,0,cvs.width,cvs.height); ctx.fillStyle="#fff";
    stars.forEach(s => { ctx.beginPath(); ctx.arc(s.x, s.y, s.s, 0, 7); ctx.fill(); s.y+=0.5; if(s.y>cvs.height) s.y=0; });
    requestAnimationFrame(draw);
} draw();