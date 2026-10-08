async function loadOrders(){
 const box=document.getElementById("ordersList"), token=getToken();
 if(!token){box.innerHTML='<div class="empty">Please <a href="login.html">login</a> to see your orders.</div>';return}
 try{
  const r=await fetch(API+"/orders",{headers:{Authorization:"Bearer "+token}});const data=await r.json();if(!r.ok)throw Error();
  box.innerHTML=data.length?data.map(o=>`<article class="order-card"><h3>Order #${o._id.slice(-6)}</h3><p>Total: ₹${o.total}</p><p>Status: <span class="status">${o.status}</span></p></article>`).join(""):'<div class="empty">No orders yet.</div>';
 }catch(e){
  const data=JSON.parse(localStorage.getItem("dinehub_orders")||"[]");
  box.innerHTML=data.length?data.map(o=>`<article class="order-card"><h3>Order #${String(o.id).slice(-6)}</h3><p>Total: ₹${o.total}</p><p>Status: <span class="status">${o.status}</span></p></article>`).join(""):'<div class="empty">No orders yet.</div>';
 }
}
loadOrders();
