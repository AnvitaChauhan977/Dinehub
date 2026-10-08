function renderCart(){
 const c=getCart(), box=document.getElementById("cartItems"), sum=document.getElementById("cartSummary");
 if(!c.length){box.innerHTML='<div class="empty">Your cart is empty.<br><br><a class="btn primary" href="menu.html">Browse Menu</a></div>';sum.innerHTML="";return}
 box.innerHTML=c.map((x,i)=>`<div class="cart-row"><div><strong>${x.emoji} ${x.name}</strong><p>₹${x.price} × ${x.qty}</p></div><div class="qty"><button onclick="changeQty(${i},-1)">−</button> <b>${x.qty}</b> <button onclick="changeQty(${i},1)">+</button> <button class="small-btn" onclick="removeItem(${i})">Remove</button></div></div>`).join("");
 const total=c.reduce((s,x)=>s+x.price*x.qty,0);
 sum.innerHTML=`<h2>Order Summary</h2><div class="summary-line"><span>Subtotal</span><b>₹${total}</b></div><div class="summary-line"><span>Delivery</span><b>₹40</b></div><hr><div class="summary-line"><span>Total</span><b>₹${total+40}</b></div><button class="btn primary" style="width:100%" onclick="checkout()">Place Order</button>`;
}
function changeQty(i,n){const c=getCart();c[i].qty+=n;if(c[i].qty<=0)c.splice(i,1);setCart(c);renderCart()}
function removeItem(i){const c=getCart();c.splice(i,1);setCart(c);renderCart()}
async function checkout(){
 const token=getToken();
 if(!token){alert("Please login before placing an order.");location.href="login.html";return}
 const c=getCart(); const total=c.reduce((s,x)=>s+x.price*x.qty,0)+40;
 try{
  const r=await fetch(API+"/orders",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({items:c,total})});
  const d=await r.json(); if(!r.ok)throw Error(d.message||"Order failed");
  setCart([]);alert("Order placed successfully!");location.href="orders.html";
 }catch(e){alert("Backend not running yet. Demo order saved locally.");const orders=JSON.parse(localStorage.getItem("dinehub_orders")||"[]");orders.unshift({id:Date.now(),items:c,total,status:"Placed"});localStorage.setItem("dinehub_orders",JSON.stringify(orders));setCart([]);location.href="orders.html"}
}
renderCart();
