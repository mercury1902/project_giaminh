const key = "AIzaSyCr1cBvXFjb41WpF0YkpwcAlmY0C9YUMHw";

async function run() {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    
    if (res.ok) {
      const data = await res.json();
      console.log("AVAILABLE MODELS:", data.models.map(m => m.name));
    } else {
      console.log(`Error ${res.status}:`, await res.text());
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

run();
