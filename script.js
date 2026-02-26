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
    if(u === "acumalaka" && p === "gblk8989") { session = {user:u, role:"OWNER"}; start(); return; }
    db.ref('users/'+u).once('value', s => {
        if(s.exists() && s.val().pass === p) { session = s.val(); start(); }
        else alert("LOGIN GAGAL!");
    });
}

function start() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('home-screen').classList.remove('hidden');
    document.getElementById('welcome-msg').innerText = `User: ${session.user}`;
    if(session.role === "OWNER") document.getElementById('admin-tools').classList.remove('hidden');
}

function show(id) {
    document.querySelectorAll('.box').forEach(b => b.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    if(id === 'list-scr') loadKeys();
}

function doGenerate() {
    let k = (document.getElementById('key_type').value === 'random') ? 
        "ZERX-" + Math.random().toString(36).substr(2,6).toUpperCase() : 
        document.getElementById('custom_key_input').value.toUpperCase();
    
    let maxD = document.getElementById('max_dev_input').value;
    if(!k) return alert("KEY KOSONG!");
    if(!maxD) return alert("ISI MAX DEVICE!");

    db.ref('license/'+k).set({
        game: document.getElementById('g_sel').value,
        day: document.getElementById('d_sel').value,
        max_device: parseInt(maxD),
        used: 0,
        status: "AKTIF"
    }).then(() => alert("BERHASIL! KEY: " + k));
}

function loadKeys() {
    db.ref('license').on('value', s => {
        let h = "";
        s.forEach(k => {
            const v = k.val();
            h += `<div style="border:1px solid cyan; margin:10px 0; padding:10px; border-radius:10px; background:rgba(0,0,0,0.4);">
                <b style="color:yellow">${k.key}</b><br>
                <div style="margin-top:10px; display:flex; gap:5px; justify-content:center;">
                    <button onclick="detailKey('${k.key}')" style="width:65px; background:blue; font-size:9px; color:white;">DETAIL</button>
                    <button onclick="editKey('${k.key}')" style="width:65px; background:orange; font-size:9px; color:white;">EDIT</button>
                    <button onclick="delKey('${k.key}')" style="width:65px; background:red; font-size:9px; color:white;">DELETE</button>
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
    const newK = prompt("EDIT KEY NAME:", k);
    const newMax = prompt("EDIT MAX DEVICE (ANGKA):");
    if(newMax) {
        if(newK && newK !== k) {
            db.ref('license/'+k).once('value', s => {
                db.ref('license/'+newK.toUpperCase()).set(s.val());
                db.ref('license/'+k).remove();
                db.ref('license/'+newK.toUpperCase()).update({max_device: parseInt(newMax)});
            });
        } else {
            db.ref('license/'+k).update({max_device: parseInt(newMax)});
        }
    }
}

function delKey(k) {
    if(confirm("YAKIN HAPUS KEY: " + k + " ?")) db.ref('license/'+k).remove();
}
