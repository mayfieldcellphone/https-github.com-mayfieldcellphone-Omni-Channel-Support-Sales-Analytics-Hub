
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, orderBy, query } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBGs5Fd1aYrVQDs_MhOgy5d8LFn5oLvXYI",
  authDomain: "repairhub-saas.firebaseapp.com",
  projectId: "repairhub-saas",
  storageBucket: "repairhub-saas.firebasestorage.app",
  messagingSenderId: "135356822613",
  appId: "1:135356822613:web:6220b004dc9193aaff50dc"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function analyzeLogs() {
  console.log("--- ONBOARDING DROP-OFF ANALYSIS ---");
  try {
    const q = query(collection(db, "audit_logs"), orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);
    const logs = snapshot.docs.map(d => d.data());

    const steps = {
      "Step 1 (Identity)": 0,
      "Step 2 (Persona)": 0,
      "Step 3 (Knowledge)": 0,
      "Step 4 (WhatsApp)": 0,
      "Step 5 (Review)": 0,
      "Completed": 0
    };

    logs.forEach(log => {
      const action = log.action || "";
      if (action.includes("Step 1")) steps["Step 1 (Identity)"]++;
      if (action.includes("Step 2")) steps["Step 2 (Persona)"]++;
      if (action.includes("Step 3")) steps["Step 3 (Knowledge)"]++;
      if (action.includes("Step 4")) steps["Step 4 (WhatsApp)"]++;
      if (action.includes("Step 5")) steps["Step 5 (Review)"]++;
      if (action.includes("Created new Business Profile")) steps["Completed"]++;
    });

    console.table(steps);
    
    // Calculate drop-off rates
    const totalStarted = steps["Step 1 (Identity)"] || steps["Completed"]; // Heuristic
    if (totalStarted > 0) {
        console.log(`Total Conversions: ${steps["Completed"]}`);
        console.log(`Completion Rate: ${((steps["Completed"] / totalStarted) * 100).toFixed(2)}%`);
    } else {
        console.log("No onboarding data found yet. The app was just updated.");
    }

  } catch (e) {
    console.error("Analysis failed:", e.message);
  }
}

analyzeLogs();
