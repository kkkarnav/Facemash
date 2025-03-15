const imgDir = "images/farm_animals/";
const imgNaming = "animal";
const arrayLength = 6;
const imageArray = [];

let selectedCategory = null;
let lastRandomItem = null;

function getRandomItem(array, excludeItems) {
  let availableItems = array.filter(item => !excludeItems.has(item));
  availableItems = availableItems.filter(item => item !== lastRandomItem);

  if (availableItems.length === 0) {
    excludeItems.clear();
    availableItems = array.filter(item => !excludeItems.has(item));
    availableItems = availableItems.filter(item => item !== lastRandomItem);
  }

  const randomIndex = Math.floor(Math.random() * availableItems.length);
  const randomItem = availableItems[randomIndex];

  lastRandomItem = randomItem;
  return randomItem;
}

function getImgName(url) {
  const lastIndex = url.lastIndexOf('/');
  if (lastIndex !== -1) {
    return url.substring(lastIndex + 1);
  }
  return url;
}

async function submitVote(category, winner, loser, voter_name) {
  if (!voter_name) voter_name = ' ';

  try {
    const response = await fetch('http://localhost:3000/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, winner, loser, voter_name }),
    });

    if (!response.ok) {
      throw new Error('Failed to submit vote');
    }
  } catch (error) {
    console.error('Error submitting vote:', error);
  }
}

async function updateEloAndDisplay(leftWin) {
  const leftImage = document.getElementById("leftImg");
  const leftImgName = getImgName(leftImage.src);

  const rightImage = document.getElementById("rightImg");
  const rightImgName = getImgName(rightImage.src);

  const voterName = document.getElementById('voterName').value || ' ';

  await submitVote(selectedCategory, leftWin ? leftImgName : rightImgName, leftWin ? rightImgName : leftImgName, voterName);

  if (leftWin) {
    const newRightImg = getRandomItem(imageArray, new Set([leftImgName.replace(/%20/g, ' '), rightImgName.replace(/%20/g, ' ')]));
    rightImage.src = imgDir + selectedCategory + "/" + newRightImg;
    document.getElementById("rightImgLabel").textContent = newRightImg.replace(/\.[^/.]+$/, "");
  } else {
    const newLeftImg = getRandomItem(imageArray, new Set([leftImgName.replace(/%20/g, ' '), rightImgName.replace(/%20/g, ' ')]));
    leftImage.src = imgDir + selectedCategory + "/" + newLeftImg;
    document.getElementById("leftImgLabel").textContent = newLeftImg.replace(/\.[^/.]+$/, "");
  }
}

function selectCategory(category) {
  selectedCategory = category;

  document.querySelectorAll(".btn-outline-maroon").forEach(button => {
    button.classList.remove("active");
  });
  document.querySelector(`button[onclick="selectCategory('${category}')"]`).classList.add("active");

  loadRandomImages();
}

function loadRandomImages() {
  if (!selectedCategory) return;

  const imageList = getImageListForCategory(selectedCategory);
  const randomIndex1 = Math.floor(Math.random() * imageList.length);
  let randomIndex2 = Math.floor(Math.random() * imageList.length);
  while (randomIndex2 === randomIndex1) {
    randomIndex2 = Math.floor(Math.random() * imageList.length);
  }

  document.getElementById("leftImg").src = imageList[randomIndex1];
  document.getElementById("rightImg").src = imageList[randomIndex2];

  document.getElementById("leftImgLabel").textContent = imageList[randomIndex1].split('/').pop().replace(/\.[^/.]+$/, "");
  document.getElementById("rightImgLabel").textContent = imageList[randomIndex2].split('/').pop().replace(/\.[^/.]+$/, "");
}

function getImageListForCategory(category) {
  const imageList = [];
  for (let i = 1; i <= arrayLength; i++) {
    imageList.push(`${imgDir}${category}/${imgNaming} (${i}).jpg`);
  }
  return imageList;
}

document.addEventListener('DOMContentLoaded', function () {
  for (let i = 1; i <= arrayLength; i++) {
    const img = imgNaming + ` (${i}).jpg`;
    imageArray.push(img);
  }

  selectCategory("breakfast");
});

async function clickLeft() {
  await updateEloAndDisplay(true);
}

async function clickRight() {
  await updateEloAndDisplay(false);
}
