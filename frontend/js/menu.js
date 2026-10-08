const demoFoods=[
{id:1,name:"Margherita Pizza",category:"Pizza",price:249,emoji:"🍕",description:"Classic tomato, mozzarella and herbs."},
{id:2,name:"Veg Burger",category:"Burger",price:149,emoji:"🍔",description:"Crispy veggie patty with fresh vegetables."},
{id:3,name:"Pasta Alfredo",category:"Pasta",price:219,emoji:"🍝",description:"Creamy pasta with herbs and parmesan."},
{id:4,name:"Paneer Tikka",category:"Indian",price:229,emoji:"🥘",description:"Tandoori paneer with aromatic spices."},
{id:5,name:"French Fries",category:"Sides",price:99,emoji:"🍟",description:"Crispy golden fries."},
{id:6,name:"Chocolate Cake",category:"Dessert",price:129,emoji:"🍰",description:"Rich chocolate cake slice."}
];
let foods=[...demoFoods], active="All";
function renderCategories(){const cats=["All",...new Set(foods.map(f=>f.category))];document.getElementById("categories").innerHTML=cats.map(c=>`<button class="chip ${c===active?"active":""}" onclick="setCategory('${c}')">${c}</button>`).join("")}
function setCategory(c){active=c;render()}
function render(){
 const q=(document.getElementById("search").value||"").toLowerCase();
 const list=foods.filter(f=>(active==="All"||f.category===active)&&(`${f.name} ${f.category}`.toLowerCase().includes(q)));
 document.getElementById("menuGrid").innerHTML=list.length?list.map(f=>`<article class="food-card"><div class="food-image">${f.emoji}</div><h3>${f.name}</h3><p>${f.description}</p><div class="food-bottom"><span class="price">₹${f.price}</span><button class="small-btn" onclick='addToCart(${JSON.stringify(f)})'>Add to cart</button></div></article>`).join(""):`<div class="empty">No food found.</div>`;
 renderCategories();
}
function addToCart(food){const c=getCart();const x=c.find(i=>i.id===food.id);if(x)x.qty++;else c.push({...food,qty:1});setCart(c);alert(food.name+" added to cart!")}
document.getElementById("search").addEventListener("input",render);
render();
