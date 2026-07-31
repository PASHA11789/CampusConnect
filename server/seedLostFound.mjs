// Uses built-in fetch (Node 18+) — no extra packages needed

const BASE_URL = "http://localhost:5000/api";

const users = [
  { email: "hamza@student.com", password: "password123" },
  { email: "zoya@student.com", password: "password123" },
  { email: "bilal@student.com", password: "password123" },
  { email: "fatima@student.com", password: "password123" },
  { email: "ali@student.com", password: "password123" },
  { email: "shujaat@mod.com", password: "password123" },
  { email: "usama@mod.com", password: "password123" },
  { email: "javeria@alumni.com", password: "password123" },
];

const posts = [
  { type:"LOST", itemName:"Samsung Galaxy S23 Ultra", category:"Electronics", description:"Lost my black Samsung Galaxy S23 Ultra near the main cafeteria. Has a cracked back. Please contact if found!", location:"Main Cafeteria" },
  { type:"FOUND", itemName:"Blue Steel Water Bottle", category:"Accessories", description:"Found a blue steel water bottle with COMSATS logo near the library entrance. Please claim with identification.", location:"Central Library", surrenderedAt:"Student Affairs Office" },
  { type:"LOST", itemName:"Data Structures Notebook", category:"Books & Notes", description:"Lost my spiral-bound data structures notebook with handwritten notes. Semester 4 CS notes. Very important for exams!", location:"Block A Classrooms" },
  { type:"FOUND", itemName:"Car Keys with BMW Keychain", category:"Keys & Cards", description:"Found a set of car keys with a distinctive BMW keychain and a small flashlight attached. Found near the parking lot.", location:"Parking Area B", surrenderedAt:"Security Office" },
  { type:"LOST", itemName:"AirPods Pro 2nd Gen", category:"Electronics", description:"Lost white AirPods Pro in their case near the computer lab. Has a small sticker on the case. URGENT!", location:"Computer Lab 3" },
  { type:"FOUND", itemName:"Student ID Card BSSE", category:"Keys & Cards", description:"Found a student ID card for a BSSE student on the 2nd floor staircase. Student can collect from reception.", location:"Academic Block 2nd Floor", surrenderedAt:"Reception Desk" },
  { type:"LOST", itemName:"Black NASA Hoodie Medium", category:"Clothing", description:"Left my black hoodie with NASA print in the cafeteria during lunchtime. Please return if found!", location:"Student Cafeteria" },
  { type:"FOUND", itemName:"Prescription Glasses Brown Case", category:"Accessories", description:"Found a pair of glasses in a brown leather case near the sports complex entrance. Please describe the case to verify.", location:"Sports Complex", surrenderedAt:"Sports Office" },
  { type:"LOST", itemName:"Leather Wallet with CS Student ID", category:"Others", description:"Lost brown leather wallet containing cash, CNIC, and student card. Please contact immediately. Reward offered!", location:"Student Cafeteria" },
  { type:"FOUND", itemName:"MacBook Pro USB-C Charger 67W", category:"Electronics", description:"Found an Apple MacBook USB-C 67W charger with cable in the library study area. Collect from library desk.", location:"Central Library", surrenderedAt:"Library Counter" },
  { type:"LOST", itemName:"Organic Chemistry Textbook", category:"Books & Notes", description:"Lost Organic Chemistry textbook Morrison and Boyd 7th edition in the D.Pharm lab area. My name is written inside.", location:"D.Pharm Lab" },
  { type:"FOUND", itemName:"Red Quechua Backpack", category:"Accessories", description:"Found a red Quechua backpack near the main gate. Contains some books and a water bottle. Kept at security post.", location:"Main Gate", surrenderedAt:"Main Gate Security Post" },
];

async function login(email, password) {
  const res = await fetch(BASE_URL + "/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!data.token) throw new Error("Login failed: " + JSON.stringify(data));
  return data.token;
}

async function submitPost(token, post) {
  const params = new URLSearchParams();
  params.append("type", post.type);
  params.append("itemName", post.itemName);
  params.append("category", post.category);
  params.append("description", post.description);
  params.append("location", post.location);
  if (post.surrenderedAt) params.append("surrenderedAt", post.surrenderedAt);

  const res = await fetch(BASE_URL + "/lost-found", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Bearer " + token,
    },
    body: params.toString(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to post");
  return data;
}

async function run() {
  console.log("Seeding 12 Lost & Found posts via API...\n");
  for (let i = 0; i < posts.length; i++) {
    const user = users[i % users.length];
    const post = posts[i];
    try {
      process.stdout.write("Login: " + user.email + "\n");
      const token = await login(user.email, user.password);
      process.stdout.write("Post: [" + post.type + "] " + post.itemName + "\n");
      await submitPost(token, post);
      console.log("OK\n");
      await new Promise(r => setTimeout(r, 300));
    } catch (err) {
      console.error("FAIL [" + post.itemName + "]: " + err.message + "\n");
    }
  }
  console.log("Done!");
}

run();
