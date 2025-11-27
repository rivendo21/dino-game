const dino = document.getElementById("dino");
const score = document.getElementById("score");
const rock = document.getElementById("rock");
const game = document.getElementById("game");

// --- Boss setup ---
let bossActive = false;
let shieldActive = false;
let enemyHits = 0;

// Create enemy element
const enemy = document.createElement("div");
enemy.id = "enemy";
enemy.style.width = "100px";
enemy.style.height = "100px";
enemy.style.position = "absolute";
enemy.style.bottom = "0px"; // on the ground
enemy.style.left = game.offsetWidth - 120 + "px";
enemy.style.backgroundColor = "red";
enemy.style.display = "none";
enemy.style.borderRadius = "10px";
game.appendChild(enemy);

// --- Jump ---
function jump() {
  if (!dino.classList.contains("jump-animation")) {
    dino.classList.add("jump-animation");
    setTimeout(() => {
      dino.classList.remove("jump-animation");
    }, 500);
  }
}

// --- Key events (jump + shield) ---
document.addEventListener("keypress", (e) => {
  if (e.key === "s" && bossActive) {
    // Activate shield
    shieldActive = true;
    dino.classList.add("shield");
    setTimeout(() => {
      shieldActive = false;
      dino.classList.remove("shield");
    }, 250);
  } else {
    // Jump for any other key
    jump();
  }
});

// --- Collision helper ---
function isColliding(a, b) {
  const aRect = a.getBoundingClientRect();
  const bRect = b.getBoundingClientRect();
  return !(
    aRect.bottom < bRect.top ||
    aRect.top > bRect.bottom ||
    aRect.right < bRect.left ||
    aRect.left > bRect.right
  );
}

// --- Boss throws small rocks ---
function throwSmallRock() {
  if (!bossActive) return;

  const smallRock = document.createElement("div");
  smallRock.classList.add("small-rock");
  smallRock.style.width = "30px";
  smallRock.style.height = "30px";
  smallRock.style.position = "absolute";
  smallRock.style.backgroundColor = "gray";
  smallRock.style.borderRadius = "50%";

  // Spawn from enemy's center
  const enemyRect = enemy.getBoundingClientRect();
  const gameRect = game.getBoundingClientRect();
  smallRock.style.bottom = enemy.offsetHeight / 2 + "px"; // vertical center relative to enemy
  smallRock.style.left = enemy.offsetLeft + "px";
  game.appendChild(smallRock);

  let posX = parseInt(smallRock.style.left);
  let direction = -10; // moving left initially

  const interval = setInterval(() => {
    posX += direction;
    smallRock.style.left = posX + "px";

    // Collision with dino
    if (isColliding(dino, smallRock)) {
      if (shieldActive && direction < 0) {
        // Reflect rock
        direction = 10;
        smallRock.style.backgroundColor = "blue";
      } else {
        clearInterval(interval);
        smallRock.remove();
        alert("Game Over! You were hit.");
        location.reload();
      }
    }

    // Collision with enemy (reflected rock)
    if (direction > 0 && isColliding(enemy, smallRock)) {
      clearInterval(interval);
      smallRock.remove();
      enemyHits++;
      if (enemyHits >= 3) {
        alert("You win! Enemy defeated!");
        location.reload();
      }
    }

    // Remove if out of game bounds
    if (posX < -50 || posX > game.offsetWidth + 50) {
      clearInterval(interval);
      smallRock.remove();
    }
  }, 50);

  // Spawn next rock
  if (bossActive) setTimeout(throwSmallRock, 2000);
}

// --- Main game loop ---
setInterval(() => {
  score.innerText++;

  const dinoBottom = parseInt(
    window.getComputedStyle(dino).getPropertyValue("bottom")
  );
  const rockLeft = parseInt(
    window.getComputedStyle(rock).getPropertyValue("left")
  );

  if (!bossActive) {
    if (rockLeft < 0) {
      rock.style.display = "none";
    } else {
      rock.style.display = "block";
    }

    if (rockLeft < 50 && rockLeft > 0 && dinoBottom <= 100) {
      rock.style.display = "none";
      alert(
        "Game Over your score is : " +
          score.innerText +
          "\n\nPress Ok to try again"
      );
      location.reload();
    }
  } else {
    // Hide original rock during boss fight
    rock.style.display = "none";
    enemy.style.display = "block";
  }

  // --- Boss trigger ---
  if (!bossActive && score.innerText >= 100) {
    bossActive = true;
    rock.style.display = "none";
    enemy.style.display = "block";
    throwSmallRock();
  }
}, 100);
