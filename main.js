const imgDir = "images/farm_animals/";
const imgNaming = "animal";
const arrayLength = 6;
const imageArray = [], sessionStorageArray = [];

let baseRating = 1000;
const k = 32; // K-factor for Elo rating system

// Track the selected category
let selectedCategory = null;

// Get a random item from the array
function getRandomItem(array) {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

// Get img name without extension from element src
function getImgName(url) {
  const lastIndex = url.lastIndexOf('/');
  if (lastIndex !== -1) {
    return url.substring(lastIndex + 1);
  }
  return url;
}

// Elo rating formula in chess
function probability(leftRating, rightRating) {
  return 1.0 * 1.0 / (1 + 1.0 * Math.pow(10, 1.0 * (leftRating - rightRating) / 400));
}

function eloRating(leftRating, rightRating, k, win) {
  let leftProb = probability(rightRating, leftRating); // left win probability
  let rightProb = probability(leftRating, rightRating); // right win probability
  if (win) { // left wins, right chosen
    leftRating = leftRating + k * (1 - leftProb); // add left rating
    rightRating = rightRating + k * (0 - rightProb); // minus right rating
  } else { // right wins. left chosen
    leftRating = leftRating + k * (0 - leftProb); // minus left rating
    rightRating = rightRating + k * (1 - rightProb); // add right rating
  }
  return { leftRating, rightRating };
}

// Update session value and get new image
function updateEloAndDisplay(leftWin) {
  var leftImage = document.getElementById("leftImg");
  var leftImgName = getImgName(leftImage.src);

  var rightImage = document.getElementById("rightImg");
  var rightImgName = getImgName(rightImage.src);

  const storedLeft = sessionStorage.getItem(leftImgName);
  const storedRight = sessionStorage.getItem(rightImgName);

  if (storedLeft == null) {
    sessionStorage.setItem(leftImgName, baseRating);
  }

  if (storedRight == null) {
    sessionStorage.setItem(rightImgName, baseRating);
  }

  const leftRating = parseFloat(sessionStorage.getItem(leftImgName));
  const rightRating = parseFloat(sessionStorage.getItem(rightImgName));

  const result = eloRating(leftRating, rightRating, k, leftWin);

  // Update the Elo ratings for the next round
  sessionStorage.setItem(leftImgName, result.leftRating);
  sessionStorage.setItem(rightImgName, result.rightRating);

  // Change image for unclicked side
  if (leftWin) {
    // Swap right image
    do {
      rightImageSource = imgDir + selectedCategory + "/" + getRandomItem(imageArray);
    } while (rightImageSource === leftImage.src);
    rightImage.src = rightImageSource;
  } else {
    // Swap left image
    do {
      leftImageSource = imgDir + selectedCategory + "/" + getRandomItem(imageArray);
    } while (leftImageSource === rightImage.src);
    leftImage.src = leftImageSource;
  }
}

// Function to select a category
function selectCategory(category) {
  // Update the selected category
  selectedCategory = category;

  // Update the subheading
  document.getElementById("category-subheading").textContent = `Category: ${category.charAt(0).toUpperCase() + category.slice(1)}`;

  // Highlight the selected button
  document.querySelectorAll(".category-button").forEach(button => {
    button.classList.remove("active");
  });
  document.getElementById(category).classList.add("active");

  // Load two random images from the selected category
  loadRandomImages();
}

// Function to load two random images from the selected category
function loadRandomImages() {
  if (!selectedCategory) return;

  // Fetch the list of images in the selected category
  const imageList = getImageListForCategory(selectedCategory);

  // Randomly select two images
  const randomIndex1 = Math.floor(Math.random() * imageList.length);
  let randomIndex2 = Math.floor(Math.random() * imageList.length);
  while (randomIndex2 === randomIndex1) {
    randomIndex2 = Math.floor(Math.random() * imageList.length);
  }

  // Update the image sources
  document.getElementById("leftImg").src = imageList[randomIndex1];
  document.getElementById("rightImg").src = imageList[randomIndex2];
}

// Placeholder function to get the list of images for a category
function getImageListForCategory(category) {
  const imageList = [];
  for (let i = 1; i <= 6; i++) { // Assuming 6 images per category
    imageList.push(`${imgDir}${category}/${imgNaming} (${i}).jpg`);
  }
  return imageList;
}

document.addEventListener('DOMContentLoaded', function () {
  // Populate the array with filenames
  for (let i = 1; i <= arrayLength; i++) {
    var img = imgNaming + ` (${i}).jpg`;
    imageArray.push(img);
    sessionStorage.setItem(img, baseRating);
  }

  // Set default category to breakfast
  selectCategory("breakfast");
});

// Left wins, right loses
function clickLeft() {
  updateEloAndDisplay(true);
}

// Right wins, left loses
function clickRight() {
  updateEloAndDisplay(false);
}
