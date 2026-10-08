const API="http://localhost:5000/api";
function getCart(){return JSON.parse(localStorage.getItem("dinehub_cart")||"[]")}
function setCart(c){localStorage.setItem("dinehub_cart",JSON.stringify(c));updateCartCount()}
function updateCartCount(){const el=document.getElementById("cartCount");if(el)el.textContent=getCart().reduce((s,x)=>s+x.qty,0)}
function getToken(){return localStorage.getItem("dinehub_token")}
function logout(){localStorage.removeItem("dinehub_token");localStorage.removeItem("dinehub_user");location.href="index.html"}
function getUser(){return JSON.parse(localStorage.getItem("dinehub_user")||"null")}
function getRecommendation(){
 const foods=[["Margherita Pizza","🍕"],["Veg Burger","🍔"],["Pasta Alfredo","🍝"],["Paneer Tikka","🥘"],["Chocolate Cake","🍰"]];
 const f=foods[Math.floor(Math.random()*foods.length)];
 document.getElementById("recommendationResult").innerHTML=`<div><strong>Try ${f[1]} ${f[0]}</strong><br><small>AI-style demo recommendation. Connect Gemini/OpenAI in the backend for real personalised recommendations.</small></div>`;
}
document.addEventListener("DOMContentLoaded",updateCartCount);
