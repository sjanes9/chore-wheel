// ===== Data & Global State =====
const chores = [
  { name: "Dishes", icon: "dishes", frequency: 1 },
  { name: "Trash", icon: "trash", frequency: 1 },
  { name: "Laundry", icon: "broom", frequency: 1 },
];

let isSpinning = false;
let angle = 0;
let spinAngle = 0;

// ===== Navigation =====
const pageSections = document.querySelectorAll(".page-section");
const navLinks = document.querySelectorAll("nav ul li a");

navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    // Hide all sections
    pageSections.forEach((section) => section.classList.add("hidden"));

    // Remove active class from links
    navLinks.forEach((nav) => nav.classList.remove("active"));

    // Show targeted section
    const target = link.getAttribute("href").replace("#", "");
    document.getElementById(target).classList.remove("hidden");
    link.classList.add("active");
  });
});

// ===== From Home to Wheel =====
document.getElementById("goToWheel").addEventListener("click", () => {
  pageSections.forEach((section) => section.classList.add("hidden"));
  document.getElementById("wheel").classList.remove("hidden");
});

// ===== Wheel =====
const canvas = document.getElementById("choreWheel");
const ctx = canvas.getContext("2d");
const spinButton = document.getElementById("spinButton");
const selectedChoreEl = document.getElementById("selectedChore");

function getTotalFrequency() {
  return chores.reduce((acc, chore) => acc + chore.frequency, 0);
}

function drawWheel() {
  const totalFreq = getTotalFrequency();
  let startAngle = 0;

  chores.forEach((chore) => {
    const sliceAngle = (2 * Math.PI * chore.frequency) / totalFreq;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2);
    ctx.arc(
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 2,
      startAngle,
      startAngle + sliceAngle
    );
    startAngle += sliceAngle;
    ctx.fillStyle = getRandomColor();
    ctx.fill();
  });
}

function getRandomColor() {
  const colors = ["#FFC107", "#4CAF50", "#FF5722", "#9C27B0", "#03A9F4"];
  return colors[Math.floor(Math.random() * colors.length)];
}

spinButton.addEventListener("click", () => {
  if (isSpinning) return;
  isSpinning = true;
  spinAngle = Math.floor(Math.random() * 2000) + 2000; // 2-5 rotations
  spin();
});

function spin() {
  if (spinAngle > 0) {
    spinAngle -= 10;
    angle += 10;
    angle %= 360;
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    drawWheel();
    ctx.restore();
    requestAnimationFrame(spin);
  } else {
    isSpinning = false;
    determineChore();
  }
}

function determineChore() {
  const fraction = (angle % 360) / 360;
  const totalFreq = getTotalFrequency();

  let sumFreq = 0;
  for (let i = 0; i < chores.length; i++) {
    const portion = chores[i].frequency / totalFreq;
    if (fraction < sumFreq + portion) {
      selectedChoreEl.textContent = chores[i].name;
      if (document.getElementById("enableTTS").checked) {
        speak(chores[i].name);
      }
      return;
    }
    sumFreq += portion;
  }
}

// ===== Text to Speech =====
function speak(text) {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  }
}

// Draw the wheel on page load
drawWheel();

// ===== Chore Management =====
const choreForm = document.getElementById("choreForm");
const choreList = document.getElementById("choreList");

function updateChoreList() {
  choreList.innerHTML = "";
  chores.forEach((chore, index) => {
    const li = document.createElement("li");
    li.textContent = `${chore.name} (freq: ${chore.frequency})`;

    // Remove button
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.style.marginLeft = "1rem";
    removeBtn.addEventListener("click", () => {
      chores.splice(index, 1);
      drawWheel();
      updateChoreList();
    });
    li.appendChild(removeBtn);
    choreList.appendChild(li);
  });
}

choreForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("choreName").value.trim();
  const icon = document.getElementById("choreIcon").value;
  const freq = parseInt(document.getElementById("choreFrequency").value, 10);

  if (name) {
    chores.push({ name, icon, frequency: freq });
    drawWheel();
    updateChoreList();
  }
  choreForm.reset();
});

updateChoreList();
