const imgDir = "images/farm_animals/";

async function loadRankings(category) {
  try {
    const response = await fetch(`https://messmash.onrender.com/rankings/${category}`);
    if (!response.ok) {
      throw new Error('Failed to fetch rankings');
    }

    const rankings = await response.json();

    document.querySelectorAll(".btn-outline-maroon").forEach(button => {
      button.classList.remove("active");
    });
    document.querySelector(`button[onclick="loadRankings('${category}')"]`).classList.add("active");

    const tableBody = document.getElementById('eloTableBody');
    tableBody.innerHTML = '';

    rankings.forEach((item, index) => {
      const row = tableBody.insertRow();
      const cell1 = row.insertCell(0);
      const cell2 = row.insertCell(1);
      const cell3 = row.insertCell(2);
      const cell4 = row.insertCell(3);
      const cell5 = row.insertCell(4);

      const imgElement = document.createElement('img');
      imgElement.src = imgDir + category + '/' + item.image;
      imgElement.style.width = '7.5rem';
      imgElement.style.height = '10rem';

      cell1.textContent = index + 1;
      cell2.appendChild(imgElement);
      cell3.textContent = item.elo_rating.toFixed(3);
      cell4.textContent = item.biggest_fan || 'N/A';
      cell5.textContent = item.biggest_hater || 'N/A';
    });
  } catch (error) {
    console.error('Error loading rankings:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadRankings("breakfast");
});
