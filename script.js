const firebaseConfig = {
  apiKey: "AIzaSyAjDUzQMk7Vs23aXk3swyQaTD1ygx6b0dY",
  databaseURL: "https://zerx-17d95-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "zerx-17d95",
  appId: "1:374648942327:web:d62d5c58b95ca5e29a6df2"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
let session = null;
let countdownInterval;

window.onload = () => {
    const saved = localStorage.getItem('zerx_session');
    if(saved) {
        session = JSON.parse(saved);
        monitorAccount(); // Mulai pantau akun biar gak bisa jebol
    }
    drawStars();
};

// --- FUNGSI PANTAU AKUN (AUTO KICK & COUNTDOWN) ---
function monitorAccount() {
    if(session.user === "acumalaka") {
        startPanel(); 
        document.getElementById('countdown-timer').innerText = "EXP: PERMANENT (OWNER)";
        return;
    }

    // Dengerin perubahan data user di Firebase secara realtime
    db.ref('users/' + session.user).on('value', s => {
        if(!s.exists()) {
            alert("AKUN ANDA TELAH DIHAPUS OLEH OWNER!");
            doLogout();
            return;
        }
        
        const data = s.val();
        session = data; // Update session data
        startPanel();
        startCountdown(data.expiry);
    });
}

function startCountdown(expireTime) {
    if(countdownInterval) clearInterval(countdownInterval);
    
    countdownInterval = setInterval(() => {
        const now = new Date().getTime();
        const dest = new Date(expireTime).getTime();
        const diff = dest - now;

        if(diff <= 0) {
            clearInterval(countdownInterval);
            document.getElementById('countdown-timer').innerText = "EXP: EXPIRED!";
            alert("MASA BERLAKU AKUN HABIS!");
            doLogout();
        } else {
            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            document.getElementById('countdown-timer').innerText = `EXP: ${d}d ${h}h ${m}m ${s}s`;
        }
    }, 1000);
}

// --- LOGIN & AUTH ---
async function authLogin() {
    const u = document.getElementById('u_log').value;
    const p = document.getElementById('p_log').value;
    if(u === "acumalaka" && p === "gblk8989") { 
        session = {user:u, role:"OWNER", expiry:"PERMANENT"}; 
        loginOk(); return; 
    }
    db.ref('users/'+u).once('value', s => {
        if(s.exists() && s.val().pass === p) { session = s.val(); loginOk(); } 
        else alert("LOGIN GAGAL!");
    });
}

function loginOk() {
    localStorage.setItem('zerx_session', JSON.stringify(session));
    monitorAccount();
}

function doLogout() {
    localStorage.removeItem('zerx_session');
    location.reload();
}

function startPanel() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('home-screen').classList.remove('hidden');
    document.getElementById('info-usn').innerText = `USN : ${session.user.toUpperCase()}`;
    if(session.role === "OWNER" || session.role === "ADMIN") {
        document.getElementById('admin-tools').classList.remove('hidden');
    }
}

// --- MANAGE USERS ---
function saveNewUser() {
    const u = document.getElementById('new_u').value;
    const p = document.getElementById('new_p').value;
    const r = document.getElementById('new_r').value;
    const e = document.getElementById('new_e_date').value; // Ambil dari DatePicker

    if(!u || !p || !e) return alert("LENGKAPI DATA!");

    db.ref('users/'+u).set({ user: u, pass: p, role: r, expiry: e })
    .then(() => { alert("USER SAVED!"); show('home-screen'); });
}

function loadUsers() {
    db.ref('users').on('value', s => {
        let h = "";
        s.forEach(u => {
            const v = u.val();
            h += `<div class="item-card">
                <b>${v.user}</b> <small>(${v.role})</small>
                <button onclick="db.ref('users/${v.user}').remove()" class="btn-red" style="float:right; width:60px;">DEL</button>
                <div style="clear:both"></div>
            </div>`;
        });
        document.getElementById('user-list-area').innerHTML = h || "KOSONG";
    });
}

// --- MANAGE KEYS (Logic sama) ---
function doGenerate() {
    let k = (document.getElementById('key_type').value === 'random') ? 
        "ZERX-" + Math.random().toString(36).substr(2,6).toUpperCase() : 
        document.getElementById('custom_key_input').value.toUpperCase();
    if(!k) return alert("ISI KEY!");
    db.ref('license/'+k).set({
        game: document.getElementById('g_sel').value, day: document.getElementById('d_sel').value,
        max_device: parseInt(document.getElementById('max_dev_input').value), used: 0, status: "AKTIF"
    }).then(() => alert("KEY CREATED!"));
}

function show(id) {
    document.querySelectorAll('.box').forEach(b => b.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    if(id === 'list-scr') loadKeys();
    if(id === 'manage-user-scr') loadUsers();
}

function toggleKeyInput() { document.getElementById('custom_key_input').classList.toggle('hidden', document.getElementById('key_type').value === 'random'); }

function loadKeys() {
    db.ref('license').on('value', s => {
        let h = "";
        s.forEach(k => {
            const v = k.val();
            h += `<div class="item-card">
                <b>${k.key}</b><br>
                <div class="btn-group">
                    <button onclick="alert('(${v.game})\\nDAY: ${v.day}\\nMAX: ${v.max_device}\\nUSED: ${v.used}')" class="btn-blue">DETAIL</button>
                    <button onclick="db.ref('license/${k.key}').remove()" class="btn-red">DELETE</button>
                </div>
            </div>`;
        });
        document.getElementById('key-list').innerHTML = h || "KOSONG";
    });
}

// BINTANG
const cvs = document.getElementById('starCanvas'); const ctx = cvs.getContext('2d');
cvs.width = window.innerWidth; cvs.height = window.innerHeight;
let stars = []; for(let i=0; i<100; i++) stars.push({x:Math.random()*cvs.width, y:Math.random()*cvs.height, s:Math.random()*1.5});
function drawStars() {
    ctx.clearRect(0,0,cvs.width,cvs.height); ctx.fillStyle="#fff";
    stars.forEach(s => { ctx.beginPath(); ctx.arc(s.x, s.y, s.s, 0, 7); ctx.fill(); s.y+=0.5; if(s.y>cvs.height) s.y=0; });
    requestAnimationFrame(drawStars);
}
