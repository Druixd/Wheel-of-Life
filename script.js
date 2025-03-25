const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
let choices = [];
let currentAngle = 0;
let savedWheels = JSON.parse(localStorage.getItem("savedWheels")) || {};
let wheelColors = [];


function loadWheel(name) {
  const wheelData = savedWheels[name];
  if (wheelData) {
    choices = [...wheelData.choices];
    wheelColors = [...wheelData.colors];
    updateChoiceList();
    drawWheel();
    
    // Display the wheel name
    const titleElement = document.getElementById("currentWheelTitle");
    titleElement.textContent = name;
    titleElement.style.display = "block";
    
    // Store current wheel name for winner saving
    currentWheelName = name;
  }
}

let currentWheelName = ""; 

// Add at the top with other variables
let savedWinners = JSON.parse(localStorage.getItem("savedWinners")) || [];

function saveWinnerToHistory(winner) {
  // Use current wheel name if available, otherwise use "Unsaved Wheel"
  const wheelName = currentWheelName || "Unsaved Wheel";
  
  savedWinners.unshift({
    wheel: wheelName,
    winner: winner,
    // timestamp: new Date().toISOString()
  });
  
  localStorage.setItem("savedWinners", JSON.stringify(savedWinners));
  
  // Close the winner popup
  document.querySelector(".winner-popup")?.remove();
  
  // Show confirmation
  alert(`Winner saved for wheel: ${wheelName}`);
}
function checkForDuplicate(choice) {
  return choices.some(item => item.toLowerCase() === choice.toLowerCase());
}

function showDuplicateConfirmation(choice, callback) {
  const popup = document.createElement("div");
  popup.className = "duplicate-confirm-popup";
  popup.innerHTML = `
    <div style="
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #16213e;
      color: white;
      padding: 30px;
      border-radius: 10px;
      text-align: center;
      z-index: 1000;
      box-shadow: 0 0 20px rgba(0,0,0,0.5);
    ">
      <h2>Duplicate Choice</h2>
      <p style="font-size: 18px; margin: 20px 0;">"${choice}" already exists in the wheel.</p>
      <p>Do you want to add it anyway?</p>
      <div style="display: flex; justify-content: center; gap: 10px; margin-top: 20px;">
        <button id="confirmAddDuplicate" style="
          background: #4CAF50;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
        ">Yes, Add It</button>
        <button id="cancelAddDuplicate" style="
          background: #e94560;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
        ">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(popup);

  document.getElementById('confirmAddDuplicate').addEventListener('click', () => {
    popup.remove();
    callback(true);
  });

  document.getElementById('cancelAddDuplicate').addEventListener('click', () => {
    popup.remove();
    callback(false);
  });
}

function showSavedWinners() {
  const popup = document.createElement("div");
  popup.className = "saved-winners-popup";
  popup.innerHTML = `
    <div style="
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #16213e;
      color: white;
      padding: 30px;
      border-radius: 10px;
      text-align: center;
      z-index: 1000;
      box-shadow: 0 0 20px rgba(0,0,0,0.5);
      max-width: 80%;
      width: 500px;
      max-height: 80vh;
      overflow: auto;
    ">
      <h2>Saved Winners</h2>
      ${savedWinners.length > 0 ? `
        <ul style="list-style: none; padding: 0; text-align: left; margin: 20px 0;">
          ${savedWinners.map(entry => `
            <li style="padding: 8px 0; border-bottom: 1px solid #0f3460;">
              <strong>${entry.wheel}:</strong> ${entry.winner}
              <!-- <div style="font-size: 0.8em; color: #aaa;">${new Date(entry.timestamp).toLocaleString()}</div> -->
            </li>
          `).join('')}
        </ul>
      ` : '<p>No winners saved yet</p>'}
      <div style="display: flex; justify-content: center; gap: 10px; margin-top: 20px;">
        <button onclick="clearSavedWinners()" style="
          background: #ff4444;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
        ">Clear All</button>
        <button onclick="this.parentNode.parentNode.remove()" style="
          background: #0f3460;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
        ">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(popup);
}
function loadWheelOfLife() {
  if (confirm("This will delete all current wheels and load the Wheel of Life collection. Continue?")) {
    // Clear current wheels
    savedWheels = {};
    
    // Load the Wheel_of_life.json data
    fetch('Wheel_of_life.json')
      .then(response => response.json())
      .then(data => {
        savedWheels = {...savedWheels, ...data};
        localStorage.setItem("savedWheels", JSON.stringify(savedWheels));
        updateSavedWheels();
        alert("Wheel of Life collection loaded successfully!");
      })
      .catch(error => {
        console.error("Error loading Wheel of Life:", error);
        alert("Failed to load Wheel of Life collection");
      });
  }
}

function loadRaceEffects() {
  if (confirm("This will delete all current wheels and load the Race Effects collection. Continue?")) {
    // Clear current wheels
    savedWheels = {};
    
    // Load the race-effects.json data
    fetch('race-effects.json')
      .then(response => response.json())
      .then(data => {
        savedWheels = {...savedWheels, ...data};
        localStorage.setItem("savedWheels", JSON.stringify(savedWheels));
        updateSavedWheels();
        alert("Race Effects collection loaded successfully!");
      })
      .catch(error => {
        console.error("Error loading Race Effects:", error);
        alert("Failed to load Race Effects collection");
      });
  }
}

function clearSavedWinners() {
  if (confirm("Are you sure you want to clear all saved winners?")) {
    savedWinners = [];
    localStorage.setItem("savedWinners", JSON.stringify(savedWinners));
    document.querySelector(".saved-winners-popup")?.remove();
    showSavedWinners(); // Refresh the popup
  }
}

// Audio elements
const spinSound = new Audio("spin.mp3");
const tickSound = new Audio("tick.mp3");

// Setup event listeners on page load
document.addEventListener("DOMContentLoaded", () => {
  const choiceInput = document.getElementById("choiceInput");
  const addChoiceBtn = document.querySelector('button[onclick="addChoice()"]');

  // Add choice on Enter key
  choiceInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addChoice();
    }
  });

  // Add choice on button click
  if (addChoiceBtn) {
    addChoiceBtn.addEventListener("click", addChoice);
  }
});


// 🎡 Draw Wheel with Consistent Colors and Pointer
function drawWheel() {
  const totalChoices = choices.length;
  if (totalChoices === 0) return;

  // Initialize colors only if not already set
  if (wheelColors.length !== totalChoices) {
    wheelColors = Array.from(
      { length: totalChoices },
      () => `hsl(${Math.random() * 360}, 70%, 60%)`
    );
  }

  const sliceAngle = (2 * Math.PI) / totalChoices;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < totalChoices; i++) {
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2);
    ctx.arc(
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 2,
      currentAngle + i * sliceAngle,
      currentAngle + (i + 1) * sliceAngle
    );
    ctx.fillStyle = wheelColors[i];
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.stroke();

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(currentAngle + (i + 0.5) * sliceAngle);
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(choices[i], canvas.width / 4, 0);
    ctx.restore();
  }

  // Draw Pointer
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, canvas.height / 2 - canvas.width / 2 - 20);
  ctx.lineTo(canvas.width / 2 - 10, canvas.height / 2 - canvas.width / 2);
  ctx.lineTo(canvas.width / 2 + 10, canvas.height / 2 - canvas.width / 2);
  ctx.closePath();
  ctx.fillStyle = "#ff0000";
  ctx.fill();
}

// ➕ Add Choice
function addChoice() {
  const input = document.getElementById("choiceInput");
  const value = input.value.trim();
  
  if (value) {
    // Check for duplicate
    if (checkForDuplicate(value)) {
      showDuplicateConfirmation(value, (shouldAdd) => {
        if (shouldAdd) {
          addChoiceToWheel(value);
        }
      });
    } else {
      addChoiceToWheel(value);
    }
    input.value = "";
  }
}

// Helper function to actually add the choice
function addChoiceToWheel(value) {
  choices.push(value);
  updateChoiceList();
  drawWheel();
}

// 🗑 Delete Choice
function deleteChoice(index) {
  choices.splice(index, 1);
  wheelColors.splice(index, 1);
  updateChoiceList();
  drawWheel();
}

// 📜 Update Choice List
function updateChoiceList() {
  const list = document.getElementById("choiceList");
  list.innerHTML = "";
  choices.forEach((choice, index) => {
    const li = document.createElement("li");
    li.innerHTML = `${choice} 
            <button onclick="deleteChoice(${index})">X</button>`;
    list.appendChild(li);
  });
}

// 🎰 Spin Wheel
function spinWheel() {
  if (choices.length === 0) return;

  // Play spin start sound
  spinSound.play();

  let spinAngle = Math.random() * 2000 + 2000;
  let spinSpeed = 20;
  let lastPassedIndex = -1;

  function animateSpin() {
    spinAngle -= spinSpeed;
    if (spinAngle > 0) {
      currentAngle += Math.PI / 20;

      // Calculate current passed index for tick sound
      const totalChoices = choices.length;
      const sliceAngle = (2 * Math.PI) / totalChoices;
      const currentIndex = Math.floor(
        ((currentAngle % (2 * Math.PI)) / (2 * Math.PI)) * totalChoices
      );

      if (currentIndex !== lastPassedIndex) {
        tickSound.currentTime = 0;
        tickSound.play();
        lastPassedIndex = currentIndex;
      }

      drawWheel();
      requestAnimationFrame(animateSpin);
    } else {
      const selectedIndex = Math.floor(
        ((currentAngle % (2 * Math.PI)) / (2 * Math.PI)) * choices.length
      );
      showWinnerPopup(choices[selectedIndex]);
    }
  }

  animateSpin();
}
// Show text input popup
function showTextInputPopup() {
  // Remove any existing popup first
  const existingPopup = document.querySelector(".text-input-popup");
  if (existingPopup) existingPopup.remove();

  const popup = document.createElement("div");
  popup.className = "text-input-popup";
  popup.innerHTML = `
      <h2>Import from Text</h2>
      <p>Enter your choices (one per line):</p>
      <textarea id="csvTextInput" placeholder="Enter choices, one per line"></textarea>
      <div style="display: flex; justify-content: space-between; margin-top: 15px;">
        <button onclick="importFromText()" style="
          background: #e94560;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
        ">Load</button>
        <button onclick="this.parentNode.parentNode.remove()" style="
          background: #0f3460;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
        ">Cancel</button>
      </div>
    `;
  document.body.appendChild(popup);

  // Show the popup
  popup.style.display = "block";
}

// Import from text input
function importFromText() {
  const textarea = document.getElementById("csvTextInput");
  if (!textarea) return;

  const text = textarea.value.trim();
  if (!text) return;

  // Clear existing choices
  choices = [];
  wheelColors = [];

  // Parse each line
  const rows = text.split(/\r?\n/);
  rows.forEach((row) => {
    const trimmedRow = row.trim();
    if (trimmedRow) {
      choices.push(trimmedRow);
    }
  });

  updateChoiceList();
  drawWheel();

  // Close the popup
  const popup = document.querySelector(".text-input-popup");
  if (popup) popup.remove();
}

// Export all wheels as JSON file
function exportAllWheels() {
  if (Object.keys(savedWheels).length === 0) {
    alert("No wheels to export!");
    return;
  }

  const dataStr = JSON.stringify(savedWheels, null, 2);
  const dataUri =
    "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

  const exportName =
    "wheel-collection-" + new Date().toISOString().slice(0, 10) + ".json";

  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportName);
  linkElement.click();
}

// Trigger file input for import
function importWheels() {
  document.getElementById("importWheelsFile").click();
}

// Handle imported wheels file
function handleWheelsImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedWheels = JSON.parse(e.target.result);

      if (
        !confirm(
          `This will import ${
            Object.keys(importedWheels).length
          } wheels. Continue?`
        )
      ) {
        return;
      }

      // Merge imported wheels with existing ones
      for (const [name, data] of Object.entries(importedWheels)) {
        // Add suffix if wheel name already exists
        let newName = name;
        let counter = 1;
        while (savedWheels[newName]) {
          newName = `${name} (${counter})`;
          counter++;
        }

        savedWheels[newName] = data;
      }

      localStorage.setItem("savedWheels", JSON.stringify(savedWheels));
      updateSavedWheels();
      alert("Wheels imported successfully!");

      // Reset file input
      event.target.value = "";
    } catch (error) {
      alert("Error importing wheels: Invalid file format");
      console.error(error);
    }
  };
  reader.readAsText(file);
}
// 🏆 Winner Popup
// 🏆 Winner Popup
function showWinnerPopup(winner) {
  const popup = document.createElement("div");
  popup.className = "winner-popup"; // Add class for easier removal
  popup.innerHTML = `
    <div style="
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #16213e;
      color: white;
      padding: 30px;
      border-radius: 10px;
      text-align: center;
      z-index: 1000;
      box-shadow: 0 0 20px rgba(0,0,0,0.5);
    ">
      <h2>Winner!</h2>
      <p style="font-size: 24px; margin: 20px 0;">${winner}</p>
      <div style="display: flex; justify-content: center; gap: 10px;">
        <button id="saveWinnerBtn" style="
          background: #4CAF50;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
        ">Save Winner</button>
        <button id="continueWinnerBtn" style="
          background: #e94560;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
        ">Continue</button>
      </div>
    </div>
  `;
  document.body.appendChild(popup);

  // Add event listeners directly to the buttons
  document.getElementById('saveWinnerBtn').addEventListener('click', () => {
    saveWinnerToHistory(winner);
  });

  document.getElementById('continueWinnerBtn').addEventListener('click', () => {
    popup.remove();
  });
}

// 💾 Save Wheel
function saveWheel() {
  const wheelName = document.getElementById("wheelName").value.trim();
  if (wheelName && choices.length > 0) {
    savedWheels[wheelName] = {
      choices: [...choices],
      colors: [...wheelColors],
    };
    localStorage.setItem("savedWheels", JSON.stringify(savedWheels));
    updateSavedWheels();
    document.getElementById("wheelName").value = ""; // Clear input after saving
  }
}

// 🗑 Delete Saved Wheel
function deleteSavedWheel(name) {
  delete savedWheels[name];
  localStorage.setItem("savedWheels", JSON.stringify(savedWheels));
  updateSavedWheels();
}

// 🗑 Delete All Saved Wheels
function deleteAllSavedWheels() {
  if (
    confirm(
      "Are you sure you want to delete ALL saved wheels? This cannot be undone."
    )
  ) {
    savedWheels = {};
    localStorage.removeItem("savedWheels");
    updateSavedWheels();
  }
}

// 🆕 Create New Wheel
function createNewWheel() {
  choices = [];
  wheelColors = [];
  currentWheelName = ""; // Clear current wheel name
  document.getElementById("currentWheelTitle").style.display = "none";
  updateChoiceList();
  drawWheel();
}

// 🔄 Load Wheel
function loadWheel(name) {
  const wheelData = savedWheels[name];
  if (wheelData) {
    choices = [...wheelData.choices];
    wheelColors = [...wheelData.colors];
    updateChoiceList();
    drawWheel();
    
    // Set and display the current wheel name
    currentWheelName = name;
    const titleElement = document.getElementById("currentWheelTitle");
    titleElement.textContent = name;
    titleElement.style.display = "block";
  }
}

// 📜 Update Saved Wheels
function updateSavedWheels() {
  const list = document.getElementById("savedWheels");
  list.innerHTML = "";

  if (Object.keys(savedWheels).length === 0) {
    const noWheelsMessage = document.createElement("li");
    noWheelsMessage.textContent = "No saved wheels";
    noWheelsMessage.style.textAlign = "center";
    noWheelsMessage.style.color = "#888";
    list.appendChild(noWheelsMessage);
    return;
  }

  Object.keys(savedWheels).forEach((name) => {
    const li = document.createElement("li");
    li.style.position = "relative";
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.alignItems = "center";
    li.style.padding = "8px";
    li.style.margin = "5px 0";
    li.style.background = "#0f3460";
    li.style.borderRadius = "4px";

    const nameSpan = document.createElement("span");
    nameSpan.innerText = name;
    nameSpan.style.flexGrow = "1";
    nameSpan.style.cursor = "pointer";
    nameSpan.onclick = () => loadWheel(name);

    const deleteBtn = document.createElement("button");
    deleteBtn.innerText = "X";
    deleteBtn.style.display = "none";
    deleteBtn.style.background = "#e94560";
    deleteBtn.style.color = "white";
    deleteBtn.style.border = "none";
    deleteBtn.style.borderRadius = "4px";
    deleteBtn.style.padding = "5px 10px";
    deleteBtn.style.marginLeft = "10px";
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      deleteSavedWheel(name);
    };

    // Hover functionality for delete button
    li.addEventListener("mouseenter", () => {
      deleteBtn.style.display = "block";
    });
    li.addEventListener("mouseleave", () => {
      deleteBtn.style.display = "none";
    });

    li.appendChild(nameSpan);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
}

// 📂 Sidebar Toggle
function toggleSidebar(id) {
  const sidebar = document.getElementById(id);
  sidebar.style.width = sidebar.style.width === "0px" ? "250px" : "0px";
}

// 📤 Import CSV
function importCSV(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const text = e.target.result;
    const rows = text.split(/\r?\n/);

    // Clear existing choices
    choices = [];
    wheelColors = [];

    // Parse each row (assuming single column CSV)
    rows.forEach((row) => {
      const trimmedRow = row.trim();
      if (trimmedRow) {
        choices.push(trimmedRow);
      }
    });

    updateChoiceList();
    drawWheel();
  };

  reader.readAsText(file);
}

// Load saved wheels on startup
updateSavedWheels();
drawWheel(); // Initial wheel draw
