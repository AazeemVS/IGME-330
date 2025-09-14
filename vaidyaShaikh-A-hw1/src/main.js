import { randomElement } from "./utils.js";

let words1 = [];
let words2 = [];
let words3 = [];

const generateTechno = num => {
  const output = document.getElementById("output");
  const lines = [];

  for (let i = 0; i < num; i++) {
    const parts = [];
    for (const list of [words1, words2, words3]) {
      parts.push(randomElement(list));
    }
    lines.push(`${parts[0]} ${parts[1]} ${parts[2]}`);
  }

  output.innerHTML =
    num > 1
      ? `<ul>${lines.map(l => `<li>${l}</li>`).join("")}</ul>`
      : lines[0];
};

// Wrappers
const handleOne = () => generateTechno(1);
const handleFive = () => generateTechno(5);

// Called once after the page has loaded
const loadBabble = () => {
  fetch("data/babble-data.json")
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(data => {
      // initialize word arrays
      words1 = data.words1 || [];
      words2 = data.words2 || [];
      words3 = data.words3 || [];

      // Adds funtionality to the buttons
      document.getElementById("my-button").addEventListener("click", handleOne);
      document.getElementById("my-button-xl").addEventListener("click", handleFive);

      // Bable displays when the page loads
      generateTechno(1);
    })
    .catch(error => {
      console.error("Failed to load babble-data.json:", error);
      const output = document.getElementById("output");
      if (output) output.textContent = "Error loading technobabble data.";
    });
};

window.addEventListener("DOMContentLoaded", loadBabble);
