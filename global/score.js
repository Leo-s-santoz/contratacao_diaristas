const score = document.querySelector(".score");

const ratings = document.querySelectorAll(".rating input");

ratings.forEach((rating) => {
  rating.addEventListener("change", () => {
    const selectedRating = rating.value;
    let text = "score";
    if (selectedRating == 5) {
      text = "Muito Bom";
    }
    if (selectedRating == 4) {
      text = "Bom";
    }
    if (selectedRating == 3) {
      text = "Mediano";
    }
    if (selectedRating == 2) {
      text = "Ruim";
    }
    if (selectedRating == 1) {
      text = "Muito Ruim";
    }
    score.textContent = `${text}`;
  });
});
