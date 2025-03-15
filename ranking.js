const imgDir = "images/farm_animals/";

// Function to load rankings for a specific category
function loadRankings(category) {
  // Update the subheading
  document.getElementById("category-subheading").textContent = `Category: ${category.charAt(0).toUpperCase() + category.slice(1)}`;

  // Highlight the selected button
  document.querySelectorAll(".category-button").forEach(button => {
    button.classList.remove("active");
  });
  document.getElementById(category).classList.add("active");

  // Filter sessionStorage items for the selected category
  const sessionStorageArray = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key.startsWith(`${category}/`)) { // Check if the key belongs to the selected category
      const value = sessionStorage.getItem(key);
      const floatValue = parseFloat(value);

      if (!isNaN(floatValue)) {
        const roundedValue = floatValue.toFixed(3);
        sessionStorageArray.push({ key, value: roundedValue });
      }
    }
  }

  // Sort by Elo rating
  sessionStorageArray.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));

  // Populate the table
  const tableBody = document.getElementById('eloTableBody');
  tableBody.innerHTML = '';

  sessionStorageArray.forEach((item, index) => {
    const row = tableBody.insertRow();
    const cell1 = row.insertCell(0);
    const cell2 = row.insertCell(1);
    const cell3 = row.insertCell(2);

    const imgElement = document.createElement('img');
    imgElement.src = imgDir + item.key;

    imgElement.style.width = '7.5rem';
    imgElement.style.height = '10rem';

    cell1.textContent = index + 1;
    cell2.appendChild(imgElement);
    cell3.textContent = item.value;
  });
}

// Load default category rankings on page load
document.addEventListener('DOMContentLoaded', function () {
  loadRankings("breakfast"); // Default to breakfast category
});
