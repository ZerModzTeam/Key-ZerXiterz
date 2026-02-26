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

// KEEP LOGIN LOGIC
window.onload = () => {
    const saved = localStorage.getItem('zerx_session');
    if(saved) {
        session = JSON.parse(saved);
        start();
    }
    drawStars();
};

async function authLogin() {
    const u = document.getElementById('u_log').value;
    const p = document.getElementById('p_log').value;
    
    // Login Owner Utama
    if(u === "acumalaka" && p === "gblk8989") { 
        session = {user:u, role:"OWNER"}; 
        saveSession(); return; 
    }

    db.ref('users/'+u).once('value', s => {
        if(s.exists() && s.val().pass === p) { 
            session = s.val(); saveSession();
        } else alert("LOGIN GAGAL!");
    });
}

function saveSession() {
    localStorage.setItem('zerx_session', JSON.stringify(session));
    start();
}

function doLogout() {
    localStorage.removeItem('zerx_session');
    location.reload();
}

function start() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('home-screen').classList.remove('hidden');
    document.getElementById('welcome-msg').innerText = `Logged in: ${session.user} [${session.role}]`;
    
    // Proteksi Menu Owner/Admin
    if(session.role === "OWNER" || session.role === "ADMIN") {
        document.getElementById('admin-tools').classList.remove('hidden');
    }
}

function show(id) {
    document.querySelectorAll('.box').forEach(b => b.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    if(id === 'list-scr') loadKeys();
    if(id === 'manage-user-scr') loadUsers();
}

function toggleKeyInput() {
    document.getElementById('custom_key_input').classList.toggle('hidden', document.getElementById('key_type').value === 'random');
}

// FIX: SAVE USER KE DATABASE
function saveNewUser() {
    const u = document.getElementById('new_u').value;
    const p = document.getElementById('new_p').value;
    const r = document.getElementById('new_r').value;
    const e = document.getElementById('new_e').value;

    if(!u || !p) return alert("ISI USER & PASS!");

    db.ref('users/'+u).set({
        user: u, pass: p, role: r, expiry: e
    }).then(() => {
        alert("USER " + u + " BERHASIL DITAMBAHKAN!");
        show('home-screen');
    }).catch(err => alert("ERROR: " + err));
}

function loadUsers() {
    db.ref('users').on('value', s => {
        let h = "";
        s.forEach(u => {
            const v = u.val();
            h += `<div class="item-card">
                <b>${v.user}</b> <span style="font-size:10px;">(${v.role})</span>
                <button onclick="deleteAccount('${v.user}')" class="btn-red" style="float:right; width:60px;">DEL</button>
                <div style="clear:both"></div>
            </div>`;
        });
        document.getElementById('user-list-area').innerHTML = h || "KOSONG";
    });
}

function deleteAccount(target) {
    if(target === "acumalaka") return alert("OWNER GAK BISA DIHAPUS!");
    if(confirm("Hapus akun " + target + "?")) db.ref('users/'+target).remove();
}

// LOGIK KEY (Tetap sama)
function doGenerate() {
    let k = (document.getElementById('key_type').value === 'random') ? 
        "ZERX-" + Math.random().toString(36).substr(2,6).toUpperCase() : 
        document.getElementById('custom_key_input').value.toUpperCase();
    let maxD = document.getElementById('max_dev_input').value;
    db.ref('license/'+k).set({
        game: document.getElementById('g_sel').value, day: document.getElementById('d_sel').value,
        max_device: parseInt(maxD), used: 0, status: "AKTIF"
    }).then(() => alert("KEY: " + k));
}

function loadKeys() {
    db.ref('license').on('value', s => {
        let h = "";
        s.forEach(k => {
            const v = k.val();
            h += `<div class="item-card">
                <b>${k.key}</b><br>
                <div class="btn-group">
                    <button onclick="detailKey('${k.key}')" class="btn-blue">DETAIL</button>
                    <button onclick="editKey('${k.key}')" class="btn-orange">EDIT</button>
                    <button onclick="delKey('${k.key}')" class="btn-red">DELETE</button>
                </div>
            </div>`;
        });
        document.getElementById('key-list').innerHTML = h || "KOSONG";
    });
}

function detailKey(k) {
    db.ref('license/'+k).once('value', s => {
        const v = s.val();
        alert(`(${v.game})\nDAY : ${v.day}\nMAX DEVICE : ${v.max_device}\nTERPAKAI : ${v.used}\nSTATUS : ${v.status}`);
    });
}

function editKey(k) {
    const newMax = prompt("MAX DEVICE BARU:", "1");
    if(newMax) db.ref('license/'+k).update({max_device: parseInt(newMax)});
}

function delKey(k) {
    if(confirm("HAPUS KEY?")) db.ref('license/'+k).remove();
}

// BINTANG GERAK
const cvs = document.getElementById('starCanvas'); const ctx = cvs.getContext('2d');
cvs.width = window.innerWidth; cvs.height = window.innerHeight;
let stars = []; for(let i=0; i<100; i++) stars.push({x:Math.random()*cvs.width, y:Math.random()*cvs.height, s:Math.random()*1.5});
function drawStars() {
    ctx.clearRect(0,0,cvs.width,cvs.height); ctx.fillStyle="#fff";
    stars.forEach(s => { ctx.beginPath(); ctx.arc(s.x, s.y, s.s, 0, 7); ctx.fill(); s.y+=0.5; if(s.y>cvs.height) s.y=0; });
    requestAnimationFrame(drawStars);
      }
